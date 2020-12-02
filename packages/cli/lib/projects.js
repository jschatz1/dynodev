const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const _ = require("lodash");
const { getProjects } = require("../services/projects");
const { sayHello } = require("../services/projects");

async function projects(options) {
  const projects = await getProjects();
  console.log(chalk.white(
    projects.data.length === 0
    ?
    "No projects yet"
    :
    _.map(
      projects.data, p => `${p.name}\t=>\t${p.uuid}`).join("\n")
    )
  );
}

module.exports = (...args) => {
  return projects(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.DYNODEV_CLI_TEST) {
      process.exit(1);
    }
  });
};