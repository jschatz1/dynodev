const inquirer = require("inquirer");
const minimist = require("minimist");
const path = require("path");
const fs = require("fs");
const { loginUser } = require("./loginUser");
const {
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");

async function login(options) {
  const targetDir = process.cwd();
  clearConsole();
  const { confirmLogin } = await inquirer.prompt({
    type: "confirm",
    name: "confirmLogin",
    message: `This will open your browser for you to log into Dyno?`,
  });
  await loginUser();
}

module.exports = (...args) => {
  return login(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMOND_CLI_TEST) {
      process.exit(1);
    }
  });
};
