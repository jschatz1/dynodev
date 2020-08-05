const models = require("../../models");
const { QueryTypes } = require("sequelize");

function getSchema({username, project}) {
  return `${username}_${project}`;
}

module.exports.getClientsTable = function getClientsTable({username, project}) {
  return `"${getSchema({username, project})}"."oauth_clients"`;
}

module.exports.getAssociationsTable = function getAssociationsTable({username, project}) {
  return `"${getSchema({username, project})}"."associations"`;
}

function getTable({username, project, model}) {
  return `"${getSchema({username, project})}"."${model}"`;
}

module.exports.getColumn = function getColumn({alias, username, project, model, column}) {
  if(alias) {
    return `"${alias}"."${column}"`;
  }
  return `${getTable({username, project, model})}."${column}"`
}

module.exports.toBase64String = function toBase64String(data) {
  const buff = Buffer.from(data, 'utf-8');
  return buff.toString('base64');
}

module.exports.fromBase64String = function fromBase64String(data) {
  const buff = Buffer.from(data, 'base64');
  // decode buffer as UTF-8
  return buff.toString('utf-8');
}

module.exports.getSchema = getSchema;
module.exports.getTable = getTable;
