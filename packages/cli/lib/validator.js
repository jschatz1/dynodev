const { almondFile } = require("./config");
const fs = require("fs");
const { chalk } = require("@vue/cli-shared-utils");

module.exports.validateFile = async function validateFile() {
  if (!fs.existsSync(almondFile)) {
    return { result: false, reason: `Missing ${almondFile}`, reasonCode: 404 };
  }

  const file = fs.readFileSync(almondFile, "utf8");
  let projectJSON = null;
  try {
    projectJSON = JSON.parse(file);
  } catch (error) {
    return { result: false, reason: error };
  }

  if (!projectJSON.project) {
    return {
      result: false,
      reason: "Missing project identifier",
      solution: `${chalk.cyan("Run")} ${chalk.green("project init")}.`,
    };
  }

  return { result: true, project: projectJSON };
};
