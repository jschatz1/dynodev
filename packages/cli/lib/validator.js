const { dynodevFile } = require("./config");
const fs = require("fs");
const { chalk } = require("@vue/cli-shared-utils");

module.exports.validateFile = async function validateFile() {
  if (!fs.existsSync(dynodevFile)) {
    return { result: false, reason: `Missing ${dynodevFile}`, reasonCode: 404 };
  }

  const file = fs.readFileSync(dynodevFile, "utf8");
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
