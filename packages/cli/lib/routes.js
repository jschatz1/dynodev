const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const { getCurrentProjectId } = require("./fileCreate");
const { getProjectRoutes } = require("../services/projects");

async function routes(options) {
  try{
    const projectUUID = getCurrentProjectId();
    const routes = await getProjectRoutes(projectUUID);
    console.log(JSON.stringify(routes.data, null, 2))
  } catch(e) {
    console.log(chalk.red(e))
  }
}

module.exports = (...args) => {
  return routes(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.DYNODEV_CLI_TEST) {
      process.exit(1);
    }
  });
};