const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const fs = require("fs");
const { almondFile } = require("./config");
const { validateFile } = require("./validator");
const { createSchema } = require("../services/projects");

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
    console.log(chalk.red("Cancelled push"));
    return;
  }
  const file = fs.readFileSync(almondFile, "utf8");
  const jsonFileContents = JSON.parse(file);
  try {
    const createdSchema = await createSchema(jsonFileContents.project, {
      contents: JSON.stringify(jsonFileContents),
    });
    console.log(chalk.green("Almond remote is up to date"));
    console.log(
      `${chalk.gray("Schema updated at")}: ${chalk.magenta(
        new Date(createdSchema.data.updated_at)
      )}`
    );
  } catch (error) {
    if(error.response.status === 404) {
      console.log(
        chalk.red(`The project with id ${jsonFileContents.project} does not exist or does not belong to you.`)
      );
    } else {
      console.log(
        chalk.red(
          "Unable to update remote at this time",
          error.response.status,
          `${error.response.data.msg||""}`
        )
      );
    }
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
