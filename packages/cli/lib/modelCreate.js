const inquirer = require("inquirer");
const _ = require("lodash");
const { clearConsole, chalk } = require("@vue/cli-shared-utils");
const { createOauth2Client } = require("../services/projects");
const { almondFile } = require("./config");

async function createProperty(model) {
  let propertyObj = {};

  const { name } = await inquirer.prompt({
    type: "input",
    name: "name",
    message: `What is the name of this property for the ${model.name} model (singular camelCase)?`,
  });

  propertyObj.name = name;

  const { propType } = await inquirer.prompt({
    type: "list",
    name: "propType",
    message: `What type of property is ${propertyObj.name}?`,
    choices: ["string", "email", "integer", "boolean", "date"],
  });

  propertyObj.type = propType;

  const { unique } = await inquirer.prompt({
    type: "confirm",
    name: "unique",
    message: `Will ${propertyObj.name} be unique?`,
  });

  propertyObj.unique = unique;

  const { nullable } = await inquirer.prompt({
    type: "confirm",
    name: "nullable",
    message: `Can ${propertyObj.name} be null?`,
  });

  propertyObj.nullable = nullable;
  return propertyObj;
}

module.exports.createAuthModel = async function createAuthModel(projectUUID) {
  return {
    "auth": true,
    "provider": "Github"
  }
}

module.exports.createModel = async function createModel() {
  let modelObj = {};
  clearConsole();
  const { model } = await inquirer.prompt({
    type: "input",
    name: "model",
    message:
      "What is the name of the model you would like to create  (singular camelCase)?",
  });
  modelObj.name = model;
  modelObj.properties = [];
  modelObj.associations = [];

  async function createModelProperty() {
    const property = await createProperty(modelObj);
    modelObj.properties.push(property);
  }

  const { createPropertiesNow } = await inquirer.prompt({
    type: "confirm",
    name: "createPropertiesNow",
    message: `Do you want to add properties to the ${modelObj.name} model now?`,
  });

  if (createPropertiesNow) {
    async function doPropertyLoop() {
      const newProperty = await createModelProperty(modelObj);
      clearConsole();
      const { anotherProperty } = await inquirer.prompt({
        type: "confirm",
        name: "anotherProperty",
        message: `Do you want to add more properties to the ${modelObj.name} model?`,
      });
      if (anotherProperty) {
        await doPropertyLoop();
      }
    }
    await doPropertyLoop();
  }

  return modelObj;
};

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
      } in your ${almondFile}.`
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
    clearConsole();
    const { anotherAssociation } = await inquirer.prompt({
      type: "confirm",
      name: "anotherAssociation",
      message: `Do you want to add more associations to the ${modelObj.name} model?`,
    });
    if (anotherAssociation) {
      await doAssociationLoop();
    } else {
      currentModelIndex += 1;
      modelObj = listOfModels[currentModelIndex];
      const { doNextAssociation } = await inquirer.prompt({
        type: "confirm",
        name: "doNextAssociation",
        message: `Do you want to add more associations?`,
      });
      if (doNextAssociation) {
        await doAssociationLoop();
      }
    }
  }
  await doAssociationLoop();

  return listOfModels;
};
