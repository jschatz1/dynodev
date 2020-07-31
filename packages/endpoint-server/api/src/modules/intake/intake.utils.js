function getSchema({username, project}) {
  return `${username}_${project}`;
}

module.exports.getClientsTable = function getClientsTable({username, project}) {
  return `${getSchema({username, project})}.oauth_clients`;
}

module.exports.getTable = function getTable({username, project, model}) {
  return `${getSchema({username, project})}.${model}`;
}

module.exports.getSchema = getSchema;