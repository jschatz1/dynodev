"use strict";
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      uuid: {
        type: DataTypes.STRING,

        unique: false,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,

        unique: false,
        allowNull: false,
      },
    },
    {}
  );

  Project.associate = function (models) {};
  return Project;
};