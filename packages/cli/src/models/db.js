const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const {almondFilePath} = require('../utils');
const adapter = new FileSync(almondFilePath());
const db = low(adapter)

module.exports.dbInit = function init() {
  db.defaults({
    project: {},
    user: {},
    models: []
  }).write();
}

module.exports.getProject = function() {
  return db.get('project').value();
}

module.exports.setProject = function(project) {
  db.set('project', project)
  .write();
}

module.exports.setModels = function(models) {
  db.set('models', models)
  .write();
}