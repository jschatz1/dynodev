const { almondFile } = require("./config");
const fs = require("fs");
const path = require("path");

const targetDir = process.cwd();

module.exports.targetDir = targetDir;

module.exports.JSONFileContentsAs = function JSONFileContentsAs({project, models}) {
  return JSON.stringify(
    {
      project,
      models,
    },
    null,
    2
  );
}

module.exports.formatJSONFile = function formatJSONFile(data) {
  return JSON.stringify(
    data,
    null,
    2
  );
}

module.exports.getJSONFileContents = function getJSONFileContents() {
  return JSON.parse(fs.readFileSync(path.join(targetDir, almondFile), 'utf8'));
}

module.exports.writeToFile = function writeToFile(data) {
  fs.writeFileSync(path.join(targetDir, almondFile), data);
}