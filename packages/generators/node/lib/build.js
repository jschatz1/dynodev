const fs = require("fs");
const { almondFile } = require("./config");
const ejs = require("ejs");
const util = require("util");
const path = require("path");
const mkdirp = require("mkdirp");
const prettier = require("prettier");
const MODE_0666 = parseInt("0666", 8);
const MODE_0755 = parseInt("0755", 8);

const {
  chalk,
  stopSpinner,
  exit,
  error,
  clearConsole,
} = require("@vue/cli-shared-utils");

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
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
  console.log(chalk.green(`Creating ${loc}${path.sep}`));
  mkdirp.sync(loc, MODE_0755);
}

function write(file, str, mode) {
  fs.writeFileSync(file, str, { mode: mode || MODE_0666 });
  console.log(chalk.green(`Creating ${file}`));
}

function createApplication(name, dir, schemaAlmondFile) {
  // Package json
  const pkg = {
    name: name,
    version: "0.0.1",
    private: true,
    scripts: {
      start: "node ./bin/www",
    },
    dependencies: {
      debug: "~2.6.9",
      express: "~4.16.1",
    },
  };
  if (dir !== ".") {
    mkdir(dir, ".");
  }
  mkdir(dir, "config");
  mkdir(dir, "migrations");
  mkdir(dir, "seeders");
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
  controllersIndexTemplate.locals.models = schemaAlmondFile.models;
  schemaAlmondFile.models.forEach(function (model) {
    // add model files
    const modelTemplate = loadTemplate("model.js");
    const moduleRoutesTemplate = loadTemplate("routes.js");
    const moduleControllersTemplate = loadTemplate("controllers.js");
    modelTemplate.locals.name = model.name;
    modelTemplate.locals.properties = model.properties;

    moduleRoutesTemplate.locals.name = model.name;

    moduleControllersTemplate.locals.modelVariable = camelize(
      underscorize(model.name.toLowerCase())
    );
    moduleControllersTemplate.locals.modelClass = pascalCase(
      underscorize(model.name)
    );
    moduleControllersTemplate.locals.properties = model.properties;

    write(
      path.join(dir, "src", "models", `${model.name}.js`),
      prettier.format(modelTemplate.render(), { semi: true, parser: "babel" })
    );

    // add module directories
    mkdir(dir, `src/modules/${model.name.toLowerCase()}`);
    // add routes
    write(
      path.join(
        dir,
        "src",
        "modules",
        model.name.toLowerCase(),
        `${model.name.toLowerCase()}.route.js`
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
        model.name.toLowerCase(),
        `${model.name.toLowerCase()}.controller.js`
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
}

async function build(name, options) {
  const targetDir = process.cwd();
  if (!fs.existsSync(almondFile)) {
    console.log(chalk.red(`missing ${almondFile}`));
    exit(1);
  }
  try {
    const schemaAlmondFile = JSON.parse(fs.readFileSync(almondFile, "utf8"));
    const destinationPath = `./api`;
    const appName = createAppName(path.resolve(destinationPath));

    emptyDirectory(destinationPath, function (empty) {
      createApplication(appName, destinationPath, schemaAlmondFile);
    });
  } catch (error) {
    console.log(chalk.red(`Not a valid ${almondFile}`));
    console.log(chalk.red(error));
  }
}

module.exports = (...args) => {
  return build(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    if (!process.env.ALMOND_CLI_TEST) {
      process.exit(1);
    }
  });
};
