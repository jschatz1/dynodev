const {
  chalk,
  stopSpinner,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");
const { sayHello } = require("../services/projects");

async function hello(options) {
  console.log(chalk.green("Hey server you there?"));
  try{
    const hello = await sayHello();
    console.log(chalk.blue(hello.data.msg))
  } catch(e) {
    console.log(chalk.red(e))
  }
}

module.exports = (...args) => {
  return hello(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMOND_CLI_TEST) {
      process.exit(1);
    }
  });
};