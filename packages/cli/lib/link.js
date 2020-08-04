const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const { getProjects } = require("../services/projects");
const { createProject, chooseProject } = require("./projectCreate");
const { JSONFileContentsAs, writeToFile, getJSONFileContents, formatJSONFile }  = require("./fileCreate");
const { almondFile, commandName } = require("./config");
const fs = require("fs");

async function link(options) {
  let toWriteToFile = "";
  let currentFileContents = {};
  if (!fs.existsSync(almondFile)) {
    console.log(chalk.red(`I don't see an ${almondFile} anywhere! Are you in your project folder? Try \`${commandName} init\``))
  }
  const projects = await getProjects();
  if (projects.data.length === 0) {
    projectUUID = await createProject();
  } else {
    projectUUID = await chooseProject();
  }

  currentFileContents = getJSONFileContents();

  currentFileContents.project = projectUUID;

  toWriteToFile = currentFileContents;

  writeToFile(formatJSONFile(toWriteToFile));
  console.log(chalk.green("Project linked!"))
}

module.exports = (...args) => {
  return link(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMOND_CLI_TEST) {
      process.exit(1);
    }
  });
};