#!/usr/bin/env node

const { chalk, semver } = require("@vue/cli-shared-utils");
const commander = require("commander");
const { dynodevFile, companyName } = require("../lib/config");
const package = require("../package.json");
const requiredVersion = package.engines.node;
const currentVersion = package.version;
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

checkNodeVersion(requiredVersion, "dynodev");
program
  .version(`dynodev ${require("../package").version}`)
  .usage("<command> [options]");

program
  .command("init")
  .description("Initialize an dynodev file. The best place to get started.")
  .action((cmd) => {
    const options = cleanArgs(cmd);
    require("../lib/init")(options);
  });

program
  .command("hello")
  .description("Says Hello!")
  .action((cmd) => {
    const options = cleanArgs(cmd);
    require("../lib/hello")(options);
  })

program
  .command("routes")
  .description("Get available API routes")
  .action((cmd) => {
    const options = cleanArgs(cmd);
    require("../lib/routes")(options);
  })

program
  .command("projects")
  .description("Gets a list of your current projects")
  .action((cmd) => {
    const options = cleanArgs(cmd);
    require("../lib/projects")(options);
  })

program
  .command("link")
  .description(`Link an existing project to your current ${dynodevFile} file.`)
  .action((cmd) => {
    const options = cleanArgs(cmd);
    require("../lib/link")(options);
  })

program
  .command("login")
  .description(`Log in to ${companyName}`)
  .action((cmd) => {
    const options = cleanArgs(cmd);

    require("../lib/login")(options);
  });

const add = new commander.Command("heat");

program.on("--help", () => {
  console.log();
  console.log(
    `  Run ${chalk.cyan(
      `dynodev <command> --help`
    )} for detailed usage of given command.`
  );
  console.log();
});

program
  .command("push")
  .description(`Push your ${dynodevFile} up and build your backend.`)
  .action((cmd) => {
    const options = cleanArgs(cmd);

    require("../lib/push")(options);
  });

program
  .command("pull")
  .description(`Pull down your latest ${dynodevFile}, replacing your existing file.`)
  .action((cmd) => {
    const options = cleanArgs(cmd);

    require("../lib/pull")(options);
  });

function makeAddCommand() {
  const add = new commander.Command("add");
  add.description("add a model or add a property to a model");
  add
    .command("model")
    .description("add a model to the dynodev.json")
    .action(() => {
      console.log("add model");
    });
  add
    .command("property")
    .description("add a property to a model in the dynodev.json")
    .action(() => {
      console.log("add property");
    });
  add
    .command("properties")
    .description(
      "add multiple properties at once to a model in the dynodev.json"
    )
    .action(() => {
      console.log("add properties");
    });
  return add;
}

// program.addCommand(makeAddCommand());

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
