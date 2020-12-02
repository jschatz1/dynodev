const inquirer = require("inquirer");
const _ = require("lodash");
const { clearConsole, chalk } = require("@vue/cli-shared-utils");
const { createOauth2Client } = require("../services/projects");
const { dynodevFile, crud } = require("./config");

async function createProperty(model) {
  let propertyObj = {};

  const { name } = await inquirer.prompt({
    type: "input",
    name: "name",
    message: `Name of property for "${model.name}" model (singular camelCase)?`,
  });

  propertyObj.name = name;

  const { propType } = await inquirer.prompt({
    type: "list",
    name: "propType",
    message: `What type of property is "${propertyObj.name}"?`,
    choices: ["string", "email", "integer", "boolean", "date"],
  });

  propertyObj.type = propType;

  const { unique } = await inquirer.prompt({
    type: "confirm",
    name: "unique",
    message: `Will "${propertyObj.name}" be unique?`,
  });

  propertyObj.unique = unique;

  const { nullable } = await inquirer.prompt({
    type: "confirm",
    name: "nullable",
    message: `Can "${propertyObj.name}" be null?`,
  });

  propertyObj.nullable = nullable;
  return propertyObj;
}

async function createAuthModel() {
  return {
    "name": "user",
    "auth": true,
    "provider": "Github",
    "associations": [],
    "authorize": [],
    "scope": {},
    "selectables": []
  }
}

module.exports.createAuthModel = createAuthModel;

async function askIfAuthNeeded() {
  const { createAuthModelNow } = await inquirer.prompt({
    type: "confirm",
    name: "createAuthModelNow",
    message: "Do you need a way for users to sign in and register for your app?"
  });
  if(createAuthModelNow) {
    return await createAuthModel();
  } else {
    return false;
  }
}

module.exports.createModel = async function createModel(listOfModelsToCreate, recreate) {
  let modelObj = {};
  const { model } = await inquirer.prompt({
    type: "input",
    name: "model",
    message:
      "Name of model? (singular camelCase)?",
  });
  if(_.find(listOfModelsToCreate, {name: model})) {
    // recursion!!
    console.log(chalk.magenta(`You already have a ${model} model! Try again.`))
    return await createModel(listOfModelsToCreate, true)
  } else if(model === "user") {
    // they haven't created a user model yet but they wrote "user"
    const checkAuthNeeded = await askIfAuthNeeded();
    if(checkAuthNeeded) {
      return checkAuthNeeded;
    }
  }
  modelObj.name = model;
  modelObj.properties = [];
  modelObj.associations = [];
  modelObj.selectables = ["*"];
  modelObj.authorize = [];
  modelObj.scope = {};

  async function createModelProperty() {
    const property = await createProperty(modelObj);
    modelObj.properties.push(property);
  }

  const { createPropertiesNow } = await inquirer.prompt({
    type: "confirm",
    name: "createPropertiesNow",
    message: `Add properties to the "${modelObj.name}" model?`,
  });

  if (createPropertiesNow) {
    async function doPropertyLoop() {
      const newProperty = await createModelProperty(modelObj);
      const { anotherProperty } = await inquirer.prompt({
        type: "confirm",
        name: "anotherProperty",
        message: `Add more properties to "${modelObj.name}" model?`,
      });
      if (anotherProperty) {
        await doPropertyLoop();
      }
    }
    await doPropertyLoop();
  }

  if(_.find(listOfModelsToCreate, {name: "user"})) {
    const { authorizations } = await inquirer.prompt({
      type: "checkbox",
      name: "authorizations",
      message: `Select authorized routes for "${modelObj.name}" model`,
      choices: crud
    });
    modelObj.authorize = authorizations;
  }

  const scope = await createScope(listOfModelsToCreate, modelObj);
  modelObj.scope = scope;
  return modelObj;
};

async function createScope(listOfModelsToCreate, currentModel) {
  const scope = {};
  const associations = currentModel.associations;
  for await (element of crud) {
    const { routeScope } = await inquirer.prompt({
      type: "list",
      name: "routeScope",
      message: `Who should be able to see the "${currentModel.name}" model ${element} route?`,
      choices: ["all", "user", "none"]
    });
    if(routeScope === "user" && !associations.length) {
      if(!_.find(listOfModelsToCreate, {name: "user"})) {
        const checkAuthNeeded = await askIfAuthNeeded();
        if(checkAuthNeeded) {
          return checkAuthNeeded;
        }
      }
    }

    scope[element] = routeScope;
  }
  return scope;
}

async function createAssociation(currentModel, modelsByName) {
  let associationObj = {};

  const { relatedModel } = await inquirer.prompt({
    type: "list",
    name: "relatedModel",
    message: `Which model is the ${currentModel.name} model related to?`,
    choices: modelsByName,
  });

  associationObj.related = relatedModel;

  const { associationType } = await inquirer.prompt({
    type: "list",
    name: "associationType",
    message: `How is the ${currentModel.name} model related to the ${relatedModel} model?`,
    choices: [
      {
        name: `${currentModel.name} has many ${relatedModel}`,
        value: "hasMany",
      },
      { name: `${currentModel.name} has one ${relatedModel}`, value: "hasOne" },
      {
        name: `${currentModel.name} belongs to ${relatedModel}`,
        value: "belongsTo",
      },
    ],
  });

  associationObj.type = associationType;
  return associationObj;
}

module.exports.createAssociationsForModels = async function createAssociationsForModels(
  models
) {
  let listOfModels = JSON.parse(JSON.stringify(models));
  let modelsByName = _.map(listOfModels, "name");
  let numModels = listOfModels.length;
  let currentModelIndex = 0;
  let modelObj = listOfModels[currentModelIndex];

  if (numModels < 2) {
    console.log(
      `You have ${numModels} ${
        numModels === 1 ? "model" : "models"
      } in your ${dynodevFile}.`
    );
    console.log(
      "You can associate your models with other models once you have at least 2 models."
    );
    return listOfModels;
  }

  async function createModelAssociation() {
    const newAssociation = await createAssociation(modelObj, modelsByName);
    listOfModels[currentModelIndex].associations.push(newAssociation);
  }

  async function doAssociationLoop() {
    if (currentModelIndex === numModels) {
      return;
    }
    await createModelAssociation(modelObj);
    const { anotherAssociation } = await inquirer.prompt({
      type: "confirm",
      name: "anotherAssociation",
      message: `Add more associations to ${modelObj.name} model?`,
    });
    if (anotherAssociation) {
      await doAssociationLoop();
    } else {
      currentModelIndex += 1;
      modelObj = listOfModels[currentModelIndex];
      const { doNextAssociation } = await inquirer.prompt({
        type: "confirm",
        name: "doNextAssociation",
        message: `Add more associations?`,
      });
      if (doNextAssociation) {
        await doAssociationLoop();
      }
    }
  }
  await doAssociationLoop();

  return listOfModels;
};
