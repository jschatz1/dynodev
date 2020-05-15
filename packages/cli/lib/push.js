const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const { almondFile } = require("./config");
const { validateFile } = require("./validator");

async function push(options) {
  console.log(chalk.cyan(`Checking your ${almondFile}`));
  const validationResult = await validateFile();
  if (validationResult.result) {
    console.log(chalk.green(`Your ${almondFile} looks good to go!`));
  } else {
    console.log(`${chalk.red(
      `There was a problem with validating your ${almondFile}:\n${validationResult.reason}`
    )}\n${validationResult.solution || ""}
    `);
  }
}

module.exports = (...args) => {
  return push(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMOND_CLI_TEST) {
      process.exit(1);
    }
  });
};
