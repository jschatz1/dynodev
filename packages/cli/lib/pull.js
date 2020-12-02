const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const { dynodevFile } = require("./config");
const { getProjectLatestSchema } = require("../services/projects");
const { validateFile } = require("./validator");

async function pull(options) {
  console.log(chalk.cyan(`Checking your ${dynodevFile}`));
  const validationResult = await validateFile();
  const projectUUID = validationResult.project.project;
  console.log(chalk.green("Pulling your latest project"));
  try{
    const latest = await getProjectLatestSchema();
    console.log(chalk.blue(pull.data.msg))
  } catch(e) {
    console.log(chalk.red(e))
  }
}

module.exports = (...args) => {
  return pull(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.DYNODEV_CLI_TEST) {
      process.exit(1);
    }
  });
};