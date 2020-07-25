const fs = require("fs");
const { almondFile } = require("./config");
const ejs = require("ejs");
const util = require("util");
const path = require("path");
const mkdirp = require("mkdirp");
const prettier = require("prettier");
const execa = require("execa");
const dotenv = require("dotenv");
const MODE_0666 = parseInt("0666", 8);
const MODE_0755 = parseInt("0755", 8);
const sleep = util.promisify(setTimeout)
let buildOptions = {
  output: {
    isJSON: false,
  },
  input: {
    isJSON: false,
    data: {},
  }
};
let finalOutput = {};

const {
  chalk,
  logWithSpinner,
  stopSpinner,
  exit,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");

let envConfig = null;

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
}

function run(command, args) {
  if (!args) {
    [command, ...args] = command.split(/\s+/);
  }
  let options = { cwd: this.context };
  if (envConfig) {
    options.env = envConfig;
  }
  return execa(command, args, options);
}

function underscorize(str) {
  return str
    .split(/(?=[A-Z])/)
    .join("_")
    .toLowerCase();
}

function pascalCase(str) {
  const s = camelize(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function loadTemplate(name) {
  const contents = fs.readFileSync(
    path.join(__dirname, "..", "templates", name + ".ejs"),
    "utf-8"
  );
  const locals = Object.create(null);

  function render() {
    return ejs.render(contents, locals, {
      escape: util.inspect,
    });
  }

  return {
    locals: locals,
    render: render,
  };
}

function createAppName(pathName) {
  return path
    .basename(pathName)
    .replace(/[^A-Za-z0-9.-]+/g, "-")
    .replace(/^[-_.]+|-+$/g, "")
    .toLowerCase();
}

function emptyDirectory(dir, fn) {
  fs.readdir(dir, function (err, files) {
    if (err && err.code !== "ENOENT") throw err;
    fn(!files || !files.length);
  });
}

function mkdir(base, dir) {
  const loc = path.join(base, dir);
  if(buildOptions.output.isJSON) {
    finalOutput[loc] = {}
  } else {
    console.log(chalk.green(`Creating ${loc}${path.sep}`));
    mkdirp.sync(loc, MODE_0755);
  }
}

function write(file, str, mode) {
  console.log("file", file);
  exit(1);
  fs.writeFileSync(file, str, { mode: mode || MODE_0666 });
  console.log(chalk.green(`Creating ${file}`));
}

async function createApplication(name, dir, schemaAlmondFile) {
  // Package json
  const pkg = {
    name: name,
    version: "0.0.1",
    private: true,
    scripts: {
      dev: "NODE_ENV=development nodemon ./src/index.js",
      "db:reset":
        "yarn sequelize-cli db:migrate:undo:all && yarn sequelize-cli db:migrate && yarn sequelize-cli db:seed:all --debug",
      "db:drop": "yarn sequelize-cli db:migrate:undo:all",
      "db:migrate": "yarn sequelize-cli db:migrate",
    },
    dependencies: {
      debug: "~2.6.9",
      express: "~4.16.1",
    },
    devDependencies: {},
  };
  if (dir !== ".") {
    mkdir(dir, ".");
  }
  mkdir(dir, "config");
  mkdir(dir, "migrations");
  mkdir(dir, "src");
  mkdir(dir, "src/middleware");
  mkdir(dir, "src/models");
  mkdir(dir, "src/modules");
  mkdir(dir, "src/public");
  mkdir(dir, "src/services");

  const configTemplate = loadTemplate("config.js");
  const middlewareIndexTemplate = loadTemplate("middleware.index");
  const modelsIndexTemplate = loadTemplate("models.index.js");
  const controllersIndexTemplate = loadTemplate("controllers.index.js");
  const indexTemplate = loadTemplate("index.js");
  const gitignoreTemplate = loadTemplate("gitignore");
  const envTemplate = loadTemplate("env");
  const modelTemplate = loadTemplate("model.js");
  const moduleRoutesTemplate = loadTemplate("routes.js");
  const moduleControllersTemplate = loadTemplate("controllers.js");
  const migrationTemplate = loadTemplate("migration.js");

  write(path.join(dir, ".env"), envTemplate.render());
  envConfig = dotenv.parse(Buffer.from(envTemplate.render()));

  controllersIndexTemplate.locals.models = schemaAlmondFile.models;
  schemaAlmondFile.models.forEach(function (model) {
    // add model files
    modelTemplate.locals.model = model;

    moduleRoutesTemplate.locals.model = model;

    moduleControllersTemplate.locals.modelVariable = camelize(
      underscorize(model.name.toLowerCase())
    );
    moduleControllersTemplate.locals.modelClass = pascalCase(
      underscorize(model.name)
    );
    moduleControllersTemplate.locals.properties = model.properties;
    write(
      path.join(dir, "src", "models", `${model.camel}.js`),
      prettier.format(modelTemplate.render(), { semi: true, parser: "babel" })
    );

    // add module directories
    mkdir(dir, `src/modules/${model.underscore}`);
    // add routes
    write(
      path.join(
        dir,
        "src",
        "modules",
        model.underscore,
        `${model.underscore}.routes.js`
      ),
      prettier.format(moduleRoutesTemplate.render(), {
        semi: true,
        parser: "babel",
      })
    );
    write(
      path.join(
        dir,
        "src",
        "modules",
        model.underscore,
        `${model.underscore}.controller.js`
      ),
      prettier.format(moduleControllersTemplate.render(), {
        semi: true,
        parser: "babel",
      })
    );
  });

  write(
    path.join(dir, "src", "modules", "index.js"),
    prettier.format(controllersIndexTemplate.render(), {
      semi: true,
      parser: "babel",
    })
  );

  pkg.dependencies.morgan = "~1.9.1";
  pkg.dependencies.axios = "^0.19.0";
  pkg.dependencies["body-parser"] = "^1.19.0";
  pkg.dependencies.compression = "^1.7.4";
  pkg.dependencies["cookie-parser"] = "^1.4.4";
  pkg.dependencies.dotenv = "^8.1.0";
  pkg.dependencies.express = "^4.17.1";
  pkg.dependencies.helmet = "^3.21.0";
  pkg.dependencies.morgan = "^1.9.1";
  pkg.dependencies.pg = "^7.12.1";
  pkg.dependencies["express-validator"] = "^6.5.0";
  pkg.dependencies.sequelize = "^5.19.0";
  pkg.devDependencies["sequelize-cli"] = "^5.5.1";
  pkg.devDependencies.nodemon = "^1.19.2";
  write(
    path.join(dir, "src", "models", "index.js"),
    modelsIndexTemplate.render()
  );
  write(path.join(dir, "config", "config.js"), configTemplate.render());
  write(
    path.join(dir, "src", "middleware", "index.js"),
    middlewareIndexTemplate.render()
  );
  write(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  write(path.join(dir, "src", "index.js"), indexTemplate.render());

  write(path.join(dir, ".gitignore"), gitignoreTemplate.render());
  logWithSpinner("🤷‍♀️", chalk.magenta(`Running yarn install`));
  const installSTDOUT = await run(`yarn --cwd ${dir}`);
  // console.log(chalk.gray(installSTDOUT.stdout));
  stopSpinner();
  let migrationGenerationSTDOUT;
  for await (model of schemaAlmondFile.models) {
    console.log(
      chalk.magenta(
        `Running: yarn --cwd ${dir} sequelize-cli migration:generate --name "create_${model.underscore}"`
      )
    );
    migrationGenerationSTDOUT = await run(
      `yarn --cwd ${dir} sequelize-cli migration:generate --name "create_${model.underscore}"`
    );
    await sleep(500);
    // console.log(chalk.gray(migrationGenerationSTDOUT.stdout));
  }
  let tryagain = 0;
  function readMigrationsDirectory() {
    const migrationFiles = fs.readdirSync(path.join(dir, "migrations"));
    if (migrationFiles.length === 0) {
      if (tryagain < 5) {
        console.log(chalk.gray("Looking for migration files."));
        tryagain += 1;
        setTimeout(readMigrationsDirectory, 1000);
      } else {
        console.log(
          chalk.red("For some reason no migration file were created.")
        );
      }
    } else {
      logWithSpinner(
        "🤷‍♀️",
        chalk.gray(
          `Running migrations on these files:\n\t${migrationFiles.join("\n\t")}`
        )
      );
      schemaAlmondFile.models.forEach(function (model) {
        const foundMigrationFile = migrationFiles.find((migrationFile) =>
          migrationFile.includes(model.underscore)
        );
        migrationTemplate.locals.model = {model, schema: schemaAlmondFile};
        write(
          path.join(dir, "migrations", foundMigrationFile),
          prettier.format(migrationTemplate.render(), {
            semi: true,
            parser: "babel",
          })
        );
      });
    }
  }
  readMigrationsDirectory();
  let migrationSTDOUT = await run(`yarn --cwd ${dir} db:migrate --debug`);
  stopSpinner();
  // console.log(chalk.gray(migrationSTDOUT.stdout));
  console.log(chalk.green("All done!"));
}

async function build(name, options) {
  buildOptions.output.isJSON = options.output && options.output.toLowerCase() === "json";

  try {
    if(options.input) {
      buildOptions.input.data = JSON.parse(options.input);
      buildOptions.input.isJSON = true
    }
  } catch {
    console.log(chalk.red('input JSON is invalid'));
    exit(1);
  }
  const targetDir = process.cwd();
  if (!buildOptions.output.isJSON && !fs.existsSync(almondFile)) {
    console.log(chalk.red(`missing ${almondFile}`));
    exit(1);
  }
  try {
    const schemaAlmondFile = JSON.parse(fs.readFileSync(almondFile, "utf8"));
    const destinationPath = `./api`;
    const appName = createAppName(path.resolve(destinationPath));
    if(buildOptions.output.isJSON) {
      await createApplication(appName, destinationPath, buildOptions.input.data);
    } else {
      emptyDirectory(destinationPath, async function (empty) {
        await createApplication(appName, destinationPath, schemaAlmondFile);
      });
    }
  } catch (error) {
    console.log(error)
    console.log(chalk.red(`Not a valid ${almondFile}`));
    console.log(chalk.red(error));
  }
}

module.exports = (...args) => {
  return build(...args).catch((err) => {
    //stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMOND_CLI_TEST) {
      process.exit(1);
    }
  });
};
