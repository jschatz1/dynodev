const models = require("../models");
const { QueryTypes } = require("sequelize");

class Utils {

  static GetSchema({username, project}) {
    return `${username}_${project}`;
  }

  static GetClientsTable({username, project}) {
    return `"${getSchema({username, project})}"."oauth_clients"`;
  }

  static GetAssociationsTable({username, project}) {
    return `"${getSchema({username, project})}"."associations"`;
  }

  static GetTable({username, project, model}) {
    return `"${getSchema({username, project})}"."${model}"`;
  }

  static GetColumn({alias, username, project, model, column}) {
    if(alias) {
      return `"${alias}"."${column}"`;
    }
    return `${getTable({username, project, model})}."${column}"`
  }

  static ToBase64String = function toBase64String(data) {
    const buff = Buffer.from(data, 'utf-8');
    return buff.toString('base64');
  }

  static FromBase64String(data) {
    const buff = Buffer.from(data, 'base64');
    // decode buffer as UTF-8
    return buff.toString('utf-8');
  }
}

class Response {
  constructor(res) {
    this.res = res;
  }

  notFound() {
    return res.status(404).json({msg: "Not found"});
  }

  unauthorized() {
    return res.status(401).json({msg: "Unauthorized"});
  }
}

class Builder {
  constructor(params) {
    this.params = params;
    this.scope = null;
  }

  async getScope() {
    if(!this.scope) {
      return await models.sequelize.query(
        `SELECT * FROM ${Utils.GetSchema(this.params)}."scoped_routes"
          WHERE "action" = 'index'
          AND "model" = '${this.params.model}' LIMIT 1;`,
        {
          type: QueryTypes.SELECT
        }
    )
    }
  }
}

module.exports.Builder = Builder;
module.exports.Response = Response;