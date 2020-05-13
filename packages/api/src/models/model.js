"use strict";
const Sequelize = require("sequelize");
const uuidv4 = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define(
    "Model",
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
        async beforeCreate(model, options) {
          model.uuid = uuidv4();
        },
      },
    }
  );

  Model.prototype.toJSON = function toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  };

  Model.associate = function (models) {
    models.Model.belongsTo(models.Project, {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return Model;
};
