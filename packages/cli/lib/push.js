const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const fs = require("fs");
const inquirer = require("inquirer");
const { dynodevFile } = require("./config");
const { validateFile } = require("./validator");
const { createSchema, doesSchemaExist, createOauth2Client } = require("../services/projects");
const _ = require("lodash");

async function push(options) {
  console.log(chalk.cyan(`Checking your ${dynodevFile}`));
  const validationResult = await validateFile();
  const projectUUID = validationResult.project.project;
  if (validationResult.result) {
    console.log(chalk.green(`Your ${dynodevFile} looks good to go!`));
  } else {
    console.log(`${chalk.red(
      `There was a problem with validating your ${dynodevFile}:\n${validationResult.reason}`
    )}\n${validationResult.solution || ""}
    `);
    console.log(chalk.red("Cancelled push"));
    return;
  }
  const file = fs.readFileSync(dynodevFile, "utf8");
  const jsonFileContents = JSON.parse(file);
  let doesSchemaExistsResult = null;
  try {
    const createdSchema = await createSchema(jsonFileContents.project, {
      contents: JSON.stringify(jsonFileContents, null, 2),
    });
    console.log(chalk.green("Dynodev remote is up to date"));
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

  if(_.find(jsonFileContents["models"], {"auth": true})) {
      let exists = false;
      try {
        doesSchemaExistsResult = await doesSchemaExist(validationResult.project.project);
        exists = doesSchemaExistsResult.data.exists;
      } catch(e) {}

      if(exists) {
        return;
      }

      console.log(chalk.white("Your app uses authentication! Let's set that up for you!"))
      const callbackURL = doesSchemaExistsResult.data.callback_url;
      const { step1 } = await inquirer.prompt({
        type: "confirm",
        name: "step1",
        message: `1 of 3.
\t* Go to https://github.com/settings/apps/ and click a "New GitHub App".
\t* Fill in "GitHub App name" and "Homepage URL"
\t* Uncheck "Active" for the "Webhook URL"
\t* Set "User authorization callback URL" to:
\t\t ${chalk.magenta(callbackURL)}
\t* Click "Create GitHub App"
\t* When ready type Y`,
      });
      const { client_id } = await inquirer.prompt({
        type: "input",
        name: "client_id",
        message: `2 of 3.
        In your new app, what is your "Client ID"?`,
      });

      const { client_secret } = await inquirer.prompt({
        type: "input",
        name: "client_secret",
        message: `3 of 3.
        In your new app, what is your "Client secret"?`,
      });
      try {
        await createOauth2Client(
          projectUUID, {
            client_id,
            client_secret,
          }
        );
        console.log(chalk.green("Your OAuth information has been securely saved!"));
        console.log(chalk.green("You can now add a sign in with GitHub button to your app!"));
      } catch(error) {
        console.log(chalk.red("Could not save your Client ID and Client secret."));
        console.log(error);
      }
  }
}

module.exports = (...args) => {
  return push(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.DYNODEV_CLI_TEST) {
      process.exit(1);
    }
  });
};
