const inquirer = require("inquirer");
const NEW_PROJECT = "NEW_PROJECT";
const { getProjects, createProject } = require("../services/projects");
const {
  chalk,
  logWithSpinner,
  stopSpinner,
  clearConsole,
} = require("@vue/cli-shared-utils");
const _ = require("lodash");

async function createProjectInput() {
  let project = {};
  const { name } = await inquirer.prompt({
    type: "input",
    name: "name",
    message: `Let's create a project first!\nWhat would you like to name the project?`,
  });

  project.name = name;

  const { description } = await inquirer.prompt({
    type: "input",
    name: "description",
    message: `Project description:`,
  });

  project.description = description;

  logWithSpinner("🎂", `Creating ${project.name}!`);
  let createdProject = await createProject(project);
  createdProject = createdProject.data;
  stopSpinner();
  clearConsole();
  console.log(chalk.green(`${project.name} has been created!`));
  console.log(chalk.gray(`Project identifier: ${createdProject.uuid}`));
  return createdProject.uuid;
}

async function chooseProjectInput() {
  logWithSpinner("⏱", `Grabbing your projects`);
  const projects = await getProjects();
  stopSpinner();
  clearConsole();
  const { projectUUID } = await inquirer.prompt({
    type: "list",
    name: "projectUUID",
    message: `Which project are you working with?`,
    choices: _.map(projects.data, (project) => {
      return { name: project.name, value: project.uuid };
    }).concat([{ name: "Create a new project", value: NEW_PROJECT }]),
  });

  if (projectUUID === NEW_PROJECT) {
    return await createProjectInput();
  }

  return projectUUID;
}

module.exports.createProject = createProjectInput;
module.exports.chooseProject = chooseProjectInput;