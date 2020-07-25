#!/usr/bin/env node

const { chalk, semver } = require("@vue/cli-shared-utils");
const commander = require("commander");

const requiredVersion = require("../package.json").engines.node;
const program = new commander.Command();

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(
      chalk.red(
        "You are using Node " +
          process.version +
          ", but this version of " +
          id +
          " requires Node " +
          wanted +
          ".\nPlease upgrade your Node version."
      )
    );
    process.exit(1);
  }
}

checkNodeVersion(requiredVersion, "almond-cli");

program
  .version(`node-almond-generator ${require("../package").version}`)
  .usage("<command> [options]");

program
  .command("build <app-name>")
  .description("build from config file")
  .option('-o, --output <string>', 'how to output data')
  .option('-i, --input <string>', 'the json file as a string, otherwise looks for almond.json file in the current location.')
  .action((name, cmd) => {
    const options = cleanArgs(cmd);
    require("../lib/build")(name, options);
  });

program
  .command("migrations-from-diff <file1> <file2>")
  .description("generate migrations from diff of two almond files")
  .action((file1, file2, cmd) => {
    console.log(file1, file2);
    require("../lib/diff")(file1, file2);
  });

program.parse(process.argv);

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {};
  cmd.options.forEach((o) => {
    const key = camelize(o.long.replace(/^--/, ""));
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== "function" && typeof cmd[key] !== "undefined") {
      args[key] = cmd[key];
    }
  });
  return args;
}
