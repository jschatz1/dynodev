const models = require("../../models");
const utils = require("../utils");

module.exports.create = async function create(req, res, next) {
  const {name} = req.body;
  if(!name) {
    return utils.missingParams(res, ["name"])
  }
  let project = null;
  try{
    project = await models.Project.create({
      name
    });
  } catch(error) {
    console.log("error", error)
  }

  return utils.created(res, project);
}
