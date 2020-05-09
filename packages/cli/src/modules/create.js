const chalk = require('chalk');
const fs = require("fs");
const projectsService = require("../services/projects");
const { almondFile } = require("../config");

module.exports = async function({command, param}) {
  console.log(chalk.gray(`Creating ${param}...`));
  if (!fs.existsSync(almondFile)) {
    fs.writeFileSync(`./${almondFile}`, '');
  }
  try {
    const project = await projectsService.create({name: param});
    console.log(chalk.green(`${param} is ready for action!`));
  } catch(error) {
    console.trace(chalk.red("Could not create your project:", "error", error));
  }
}