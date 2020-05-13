const models = require("../../models");
const utils = require("../utils");

module.exports.show = async function create(req, res, next) {
  const {uuid} = req.params;
  let project = null;
  try{
    project = await models.Project.findOne({
      where: {
        uuid
      }
    });
    if(!project) {
      return utils.notFound(res,  `Project with id: ${uuid} does not exist`);
    }
    projectModels = await models.Model.findAll({
      include: {
        model: models.Project,
        where: {
          uuid
        }
      }
    });
    return utils.show(res, projectModels);
  } catch(error) {
    console.log("error", error)
  }
}
