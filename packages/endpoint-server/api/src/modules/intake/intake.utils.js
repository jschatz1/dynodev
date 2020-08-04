function getSchema({username, project}) {
  return `${username}_${project}`;
}

module.exports.getClientsTable = function getClientsTable({username, project}) {
  return `"${getSchema({username, project})}"."oauth_clients"`;
}

module.exports.getTable = function getTable({username, project, model}) {
  return `"${getSchema({username, project})}"."${model}"`;
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