"use strict";
const Sequelize = require("sequelize");
const uuidv4 = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      uuid: {
        type: Sequelize.STRING,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        unique: false,
      },
    },
    {
      hooks: {
        async beforeCreate(project, options) {
          project.uuid = uuidv4();
        },
      },
    }
  );

  Project.prototype.toJSON = function toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  };
  return Project;
};
