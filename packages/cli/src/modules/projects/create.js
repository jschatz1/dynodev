const chalk = require('chalk');
const fs = require("fs");
const projectsService = require("../../services/projects");
const modelsService = require("../../services/models");
const { almondFile } = require("../../config");
const { almondFilePath, join } = require("../../utils");
const { dbInit, setProject, setModels, getProject } = require("../../models/db");
const prompt = require("prompt");
const yn = require("yn");
const _ = require("lodash");


module.exports = async function({command, param}) {
  console.log(chalk.gray(`Creating ${param}...`));
  let isEmpty = false;
  if (!fs.existsSync(almondFile)) {
    fs.writeFileSync(`./${almondFile}`, '');
    console.log(chalk.gray(`Creating ${almondFile}`))
    isEmpty = true;
  } else {  
    console.log(chalk.gray(`Using existing ${almondFile} file`))
  }
  dbInit();
  if(!isEmpty) {
    const currentProject = getProject();


    async function createProject() {
        try {
          const project = await projectsService.create({name: param});
          setProject(project.data);
          const models = await modelsService.show(project.data.uuid);
          setModels(models.data);
          console.log(chalk.gray(`Updating projects and models in ${almondFile}`));
          console.log(chalk.green(`${param} is ready for action!`));

        } catch(error) {
          console.trace(chalk.red("Could not create your project:", error.response.data.msg));
        }
    }
    if(
      _.hasIn(currentProject, "uuid") &&
      _.hasIn(currentProject, "name")
    ) {
      console.log(chalk.green(`Your ${almondFile} already has a project with the following information:`));
      console.log(join([
        chalk.gray("uuid: "),
        chalk.blue(currentProject["uuid"])
      ]));
      console.log(join([
        chalk.gray("name: "),
        chalk.blue(currentProject["name"])
      ]));
      prompt.get([{
        name: 'overwrite',
        description: `Should we overwrite your existing ${almondFile}?`,
        type: 'string',
        required: true
      }], function(err, results) {
        if(yn(results.overwrite)) {
          createProject();
        }
      });
      return;
    } else {
      createProject();
    }
  }
}