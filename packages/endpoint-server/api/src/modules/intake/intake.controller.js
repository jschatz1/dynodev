const { QueryTypes } = require("sequelize");
const models = require("../../models");
const { getSchema, getTable, getAssociationsTable, getColumn } = require("./intake.utils");
const _ = require("lodash");
const { Builder, Response } = require("../../sql/builder");

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
  } catch (e) {
    console.log(e)
    return res.status(422).json({ detail: e.parent.detail, sql: e.parent.sql });
  }
};

module.exports.hello = function hello(req, res) {
  return res.json({msg: "Hello"});
}

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

  let selectables = false;

  let associations = false;
  let association;
  let hasAssociations = false;
  let selectables_model;
  let selectables_association = `["*"]`;
  let hasUserScope = false
  // find the associations. e.g. hasMany etc.
  const builder = new Builder(req.params);
  const response = new Response(res);
  const scope = await builder.getScope();
  if(scope.length && scope[0].scope === 'none') {
    return response.notFound();
  }

  if(scope.length && scope[0].scope === 'user') {
    hasUserScope = true;
  }

  if(hasUserScope && !req.user) {
    return response.unauthorized();
  }


  try {
    associations = await models.sequelize
      .query(`SELECT * FROM ${getAssociationsTable(req.params)} WHERE "related" = '${model}' LIMIT 1`,
        {
          type: QueryTypes.SELECT
        });
    hasAssociations = associations.length;
    if(hasAssociations) {
      association = associations[0];
    }
  } catch(e) {
    console.log("error associations", e)
  }

  // choose what should be selected
  try {
    selectables_model = await models.sequelize
      .query(`SELECT * FROM ${getTable({username, project, model: "selections"})} WHERE "model" = '${model}';`, {
        type: QueryTypes.SELECT
      });
      selectables_model = selectables_model[0].selections
    if(hasAssociations) {
      selectables_association = await models.sequelize
      .query(`SELECT * FROM ${getTable({username, project, model: "selections"})} WHERE "model" = '${association.model}';`, {
        type: QueryTypes.SELECT
      });
      selectables_association = selectables_association[0].selections
    }
  } catch(e) {
    console.log("error selectables", e);
  }

  selectables_model = JSON.parse(selectables_model);
  selectables_association = JSON.parse(selectables_association);
  if(!Array.isArray(selectables_model)) {
    selectables_model = ["*"];
  }

  if(!Array.isArray(selectables_association)) {
     selectables_association = ["*"]
  }

  // dedup just in case
  selectables_model = _.uniq(selectables_model);
  selectables_association = _.uniq(selectables_association);

  // build selection
  if(selectables_model[0] === "*") {
    list_of_columns = await models.sequelize.query(`SELECT column_name,data_type 
      FROM information_schema.columns 
      where table_schema = '${getSchema(req.params)}'
      AND table_name = '${model}';`, { type: QueryTypes.SELECT })
    selectables_model = _.map(list_of_columns, 'column_name');
  }

  if(selectables_association[0] === "*" && hasAssociations) {
    list_of_columns = await models.sequelize.query(`SELECT column_name,data_type 
      FROM information_schema.columns 
      where table_schema = '${getSchema(req.params)}'
      AND table_name = '${association.model}';`, { type: QueryTypes.SELECT })
    selectables_association = _.map(list_of_columns, 'column_name');
  }

  let params = {};
  let selection = selectables_model.concat(selectables_association);
  selection = selectables_model.map(column => {
    params = hasAssociations ? {alias: "a", column} : {username, project, model, column};
    return getColumn(params);
  })
  if(hasAssociations){
    selection = selection.concat(selectables_association.map(column => {
      params = hasAssociations ? {alias: "b", column} : {username, project, model: association.model, column};
      return getColumn(params)
    }));
  }

  let results
  if(hasAssociations) {
    const table = getTable(req.params);
    const joinTable = getTable({username, project, model: association.model});
    try{
      results = await models.sequelize
       .query(`SELECT ${selection.join(",")}
          FROM ${table}
          AS a JOIN ${joinTable}
          AS b ON a.${association.model_key} = b.id
          ${hasUserScope
            ? `WHERE ${getColumn({alias:'a', column:'user_id'})} = ${req.user.id}`
            : ''};`,
            {
              type: QueryTypes.SELECT
            }
        );
      return res.json({results})
    } catch(e) {
      console.log(e)
      return res.status(422).json({detail: e.parent.detail})
    }
  } else {
    try {
      results = await models.sequelize
        .query(`SELECT ${selection.join(",")}
          FROM ${getTable(req.params)}
          ${hasUserScope
            ? `WHERE ${getColumn({...req.params, column:'user_id'})} = ${req.user.id}`
            : ''};`,
            {
              type: QueryTypes.SELECT
            });
      return res.json({results})
    } catch(e) {
      console.log(e)
      return res.status(422).json({detail: e.parent.detail})
    }
  }
};


module.exports.authGitHub = function() {}

// auth
module.exports.authGitHubCallback = function authGitHubCallback(req, res) {
  res.redirect("/");
}