const inquirer = require("inquirer");
const minimist = require("minimist");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const { dynodevFile, docsSite } = require("./config");
const { getProjects } = require("../services/projects");
const { JSONFileContentsAs, writeToFile }  = require("./fileCreate");
const { createModel, createAuthModel, createAssociationsForModels } = require("./modelCreate");
const { createProject, chooseProject } = require("./projectCreate");
const {
  chalk,
  stopSpinner,
  exit,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");

async function init(options) {
  clearConsole();
  let createInitFile = false;
  let listOfModelsToCreate = [];
  let toWriteToFile = "";
  let projectUUID = "";
  let didAddAuth = false;

  if (!fs.existsSync(dynodevFile)) {
    createInitFile = true;
  } else {
    const { overwriteDynodevFile } = await inquirer.prompt({
      type: "confirm",
      name: "overwriteDynodevFile",
      message: `Overwrite existing ${dynodevFile}?`,
    });
    createInitFile = overwriteDynodevFile;
  }

  if (createInitFile) {
    const projects = await getProjects();
    if (projects.data.length === 0) {
      projectUUID = await createProject();
    } else {
      projectUUID = await chooseProject();
    }

    const { createAuthModelNow } = await inquirer.prompt({
      type: "confirm",
      name: "createAuthModelNow",
      message: "Do you want Sign in with GitHub?"
    });

    if (createAuthModelNow) {
      const newAuthModel = await createAuthModel(projectUUID);
      listOfModelsToCreate.unshift(newAuthModel)
      console.log(chalk.green("Your user model has been saved."));
      didAddAuth = true;
    }

    const { createModelsNow } = await inquirer.prompt({
      type: "confirm",
      name: "createModelsNow",
      message: `Add models? You can always add them later.`,
    });

    if (createModelsNow) {
      async function doIt() {
        const newModel = await createModel(listOfModelsToCreate);

        // find the index of the user model
        const userModelIndex = _.findIndex(listOfModelsToCreate, ['name', 'user']);
        // find the index of the 
        const hasScopeWithUser = _.some(_.values(newModel.scope), _.matches("user"))
        if(userModelIndex > -1 && hasScopeWithUser) {
          listOfModelsToCreate[userModelIndex].associations.push({
              "related": newModel.name,
              "type": "hasMany"
            });
        }

        listOfModelsToCreate.push(newModel);

        const { createAnotherModel } = await inquirer.prompt({
          type: "confirm",
          name: "createAnotherModel",
          message: `Your model has been saved. Would you like to create another model?`,
        });
        if (createAnotherModel) {
          await doIt();
        }
      }
      await doIt();
    }

    const { createAssociationNow } = await inquirer.prompt({
      type: "confirm",
      name: "createAssociationNow",
      message: `Add associations to your models?`,
    });

    if (createAssociationNow) {
      listOfModelsToCreate = await createAssociationsForModels(
        listOfModelsToCreate
      );
    }
  }

  if (createInitFile) {
    toWriteToFile = JSONFileContentsAs(
    {
      project: projectUUID,
      models: listOfModelsToCreate
    });

    writeToFile(toWriteToFile);

    console.log(chalk.green(`🎉  ${dynodevFile} has been created`));
  } else {
    console.log(chalk.red(`🤷‍♀️ ${dynodevFile} was not created`));
  }
}

module.exports = (...args) => {
  return init(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.DYNODEV_CLI_TEST) {
      process.exit(1);
    }
  });
};
