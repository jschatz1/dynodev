const chalk = require('chalk');
const fs = require("fs");
const projectsService = require("../../services/projects");
const modelsService = require("../../services/models");
const { almondFile } = require("../../config");
const { almondFilePath, join } = require("../../utils");
const { dbInit, getProject, setModels } = require("../../models/db")


module.exports = async function({command, param}) {
  console.log(chalk.gray(`Creating model ${param}...`));
  let isEmpty = false;

  async function createModel() {
    try {
      const project = await modelsService.create({name: param});
      const currentProject = getProject();
      const models = await modelsService.show(currentProject["uuid"]);
      setModels(models.data);
      console.log(chalk.gray(`Updating models and models in ${almondFile}`));
      console.log(chalk.green(`${param} is ready for action!`));

    } catch(error) {
      console.trace(chalk.red("Could not create your project:", error.response.data.msg));
    }
  }

  if (!fs.existsSync(almondFile)) {
    fs.writeFileSync(`./${almondFile}`, '');
    console.log(
      utils.join([
        chalk.blue(`We're not seeing a ${almondFile} anywhere.`),
        chalk.blue(`You should create a project first. Try:`),
        chalk.green('create project myfunproject')
      ])
    );
    return;
  }
}