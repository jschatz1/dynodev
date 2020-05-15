const inquirer = require("inquirer");
const minimist = require("minimist");
const path = require("path");
const fs = require("fs");
const { almondFile, docsSite } = require("./config");
const { getProjects } = require("../services/projects");
const { createModel, createAssociationsForModels } = require("./modelCreate");
const { createProject, chooseProject } = require("./projectCreate");
const {
  chalk,
  stopSpinner,
  exit,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");

async function init(options) {
  const targetDir = process.cwd();
  clearConsole();
  let createInitFile = false;
  let listOfModelsToCreate = [];
  let toWriteToFile = "";
  let projectUUID = "";

  if (!fs.existsSync(almondFile)) {
    createInitFile = true;
  } else {
    const { overwriteAlmondfile } = await inquirer.prompt({
      type: "confirm",
      name: "overwriteAlmondfile",
      message: `Overwrite existing ${almondFile}?`,
    });
    createInitFile = overwriteAlmondfile;
  }

  if (createInitFile) {
    const projects = await getProjects();
    if (projects.data.length === 0) {
      projectUUID = await createProject();
    } else {
      projectUUID = await chooseProject();
    }

    const { createModelsNow } = await inquirer.prompt({
      type: "confirm",
      name: "createModelsNow",
      message: `Models are like tables in a database. Do you know what models you want to add to your ${almondFile}? You can always add them later.`,
    });

    if (createModelsNow) {
      async function doIt() {
        const newModel = await createModel();
        listOfModelsToCreate.push(newModel);
        clearConsole();
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
      message: `Do you want to create associations with your models?`,
    });

    if (createAssociationNow) {
      listOfModelsToCreate = await createAssociationsForModels(
        listOfModelsToCreate
      );
    }
  }

  if (createInitFile) {
    toWriteToFile = JSON.stringify(
      {
        project: projectUUID,
        models: listOfModelsToCreate,
      },
      null,
      2
    );
    fs.writeFileSync(`${targetDir}/${almondFile}`, toWriteToFile);
    console.log(chalk.green(`🎉  ${almondFile} has been created`));
  } else {
    console.log(chalk.red(`🤷‍♀️ ${almondFile} was not created`));
  }
  console.log(
    `\n📘📓📗 Visit our docs for some next steps:\n📕📙📒 ${chalk.cyan(
      docsSite
    )}`
  );
}

module.exports = (...args) => {
  return init(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMON_CLI_TEST) {
      process.exit(1);
    }
  });
};
