const { QueryTypes } = require("sequelize");
const models = require("../../models");
const { getTable } = require("./intake.utils");

module.exports.create = async function create(req, res, next) {
  const reqBody = req.body;
  const model = req.params.model;
  const keys = Object.keys(reqBody);
  try {
    const result = await models.sequelize.query(
      `INSERT INTO ${getTable(req.params)} (${keys.map(k => `"${k}"`).join(", ")}, "created_at", "updated_at") VALUES (${keys.map(a => "(?)").join(', ')}, NOW(), NOW());`,
      {
        replacements: keys.map(k => reqBody[k]),
        type: QueryTypes.INSERT
      });
    return res.json({result});
  } catch (error) {
    console.trace(error);
    return res.status(422).json({ msg: `unable to create ${model}`, error });
  }
};

module.exports.show = async function show(req, res) {
  const id = req.params.id;
  const model = req.params.model;
  try {
    const found = await models.sequelize.query(
      `SELECT * FROM ${getTable(req.params)} WHERE "id" = :id LIMIT 1;`, 
      {
        replacements: {
          id,
        },
        type: QueryTypes.SELECT
      });
    if(!found.length) {
      return res.status(404).json({msg: `unable to find ${model}`})
    }
    return res.json(found[0]);
  } catch (error) {
    console.trace(error);
    return res.status(422).json({ msg: `unable to find ${model}`, error });
  }
};

module.exports.update = async function update(req, res, next) {
  const id = req.params.id;
  const reqBody = req.body;

  const model = req.params.model;
  const keys = Object.keys(reqBody);
  const replacements = reqBody;
  replacements['id'] = id;

  try {
    const result = await models.sequelize.query(
      `UPDATE ${getTable(req.params)} SET ${keys.map(k => `"${k}" = :${k}`).join(", ")} WHERE "id" = :id;`,
      {
        replacements,
        type: QueryTypes.UPDATE
      });
    return res.json({result});
  } catch (error) {
    console.trace(error);
    return res.status(422).json({ msg: `unable to create ${model}`, error });
  }
};

module.exports.destroy = async function destroy(req, res, next) {
  const id = req.params.id;
  try {
    let intake = await models.Car.findOne({
      where: {
        id,
      },
    });
    if (!intake) {
      return res.status(404).json({ msg: "not found" });
    }
    await intake.destroy();
  } catch (error) {
    return res.status(404).json({ msg: "cannot delete intake" });
  }
};

module.exports.index = async function index(req, res, next) {
  const {username, project, model} = req.params;
  try {
    const results = await models.sequelize
      .query(`SELECT * FROM ${getTable(req.params)};`, { type: QueryTypes.SELECT });
    return res.json({results})
  } catch (error) {
    console.trace(error);
    return res.status(404).json({ msg: `unable to find ${model}` });
  }
};


module.exports.authGitHub = function() {}

// auth
module.exports.authGitHubCallback = function authGitHubCallback(req, res) {
  res.redirect("/");
}