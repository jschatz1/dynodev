const inquirer = require("inquirer");
const minimist = require("minimist");
const path = require("path");
const fs = require("fs");
const { almondFile, docsSite } = require("./config");
const {
  chalk,
  stopSpinner,
  exit,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");

async function add(action, options) {
  console.log(action, options);
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
