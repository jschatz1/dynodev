const {
  chalk,
  stopSpinner,
  exit,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");

const fs = require("fs");
const jsonDiffPatch = require("jsondiffpatch");
const changeType = {
  renameTable: "renameTable",
  renameColumn: "renameColumn",
  changeColumn: "changeColumn",
  createTable: "createTable",
  createColumn: "createColumn",
  dropTable: "dropTable",
};
const dropTable = {
  tableName: "tableName",
};
const renameTable = {
  before: "before",
  after: "after"
};
const renameProperties = {
  attrNameBefore: "attrNameBefore",
  attrNameAfter: "attrNameAfter",
};

let file1Data;
let file2Data;

function keysWithoutType(keys) {
  return keys.filter(k => k !== '_t');
}

function mapPropertyChanges(model, key) {
  const properties = model.properties;
  if(!properties) {
    return;
  }
  const propKeys = keysWithoutType(Object.keys(properties));
  propertyMigrations = propKeys.map(function(propKey) {
    let name = null;
    let changeTypes = [];
    let propertyKeys = Object.keys(file1Data.models[key].properties[propKey]);
    if(!properties[propKey].name) {
      name = file1Data.models[key].properties[propKey].name
      propertyKeys.splice(propertyKeys.indexOf("name"), 1);
    } else {
      changeTypes.push(changeType.renameColumn);
    }

    if(propertyKeys.length > 0) {
      changeTypes.push(changeType.changeColumn);
    }

    return {
      types: changeTypes,
      name,
      properties: properties[propKey]
    }
  });

  return propertyMigrations;

}

function mapDeleteTable(model) {
  if(Array.isArray(model) &&
      model.length === 3 &&
      model[1] === 0 &&
      model[2] === 0){
    model = model[0];
    return {
      type: changeType.dropTable,
      tableName: model.name
    }
  }
}

function mapNewTable(model) {
  if(Array.isArray(model) &&
    model.length === 1){
    model = model[0];
    return {
      type: changeType.createTable,
      model
    }
  }
}

function mapTableNameChanges(model) {
  if(!model.name || !Array.isArray(model.name)) return {};

  return {
    type: changeType.renameTable,
    [renameTable.before]: model.name[0],
    [renameTable.after]: model.name[1]
  }
}

function modelLoop(models, key) {
  model = models[key];
  const newTable = mapNewTable(model);
  if(newTable) {
    return {
      ...newTable,
    }
  }
  const deletedTable = mapDeleteTable(model);
  if(deletedTable) {
    return {
      ...deletedTable
    }
  }
  let tableNameChanges = mapTableNameChanges(model);
  tableNameChanges.properties = mapPropertyChanges(model, key);
  return {
    ...tableNameChanges,
  };
}

function isDifferenceInModels(diff) {
  const models = diff.models;
  if(!models) return;
  let keys = Object.keys(models);
  keys = keysWithoutType(keys);
  if(!keys.length) return;

  // loop through models;
  const migrations = keys.map(function(key){
    return modelLoop(models, key)
  });
  console.log("migrations", JSON.stringify(migrations, null, 2));
}

async function diff(file1, file2) {
  file1Data = JSON.parse(fs.readFileSync(file1, 'utf8'));
  file2Data = JSON.parse(fs.readFileSync(file2, 'utf8'));
  const delta = jsonDiffPatch.diff(file1Data, file2Data);
  // console.log("DELTA", JSON.stringify(delta, null, 2))
  if(delta) {
    const hasDiff = isDifferenceInModels(delta);
  }
}

module.exports = (...args) => {
  return diff(...args).catch((err) => {
    //stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMOND_CLI_TEST) {
      process.exit(1);
    }
  });
};