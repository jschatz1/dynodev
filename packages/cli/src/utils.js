const path = require("path");
const {almondFile} = require("./config");

module.exports.join = function(items) {
  return items.join(" ");
}

module.exports.almondFilePath = function() {
  return path.resolve(`./${almondFile}`);
}