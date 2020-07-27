"use strict";
module.exports = (sequelize, DataTypes) => {
  const Deployment = sequelize.define(
    "Deployment",
    {
      name: {
        type: DataTypes.STRING,

        unique: true,
        allowNull: false,
      },
    },
    {}
  );

  Deployment.associate = function (models) {
    models.Deployment.hasMany(models.Pod);
  };
  return Deployment;
};
