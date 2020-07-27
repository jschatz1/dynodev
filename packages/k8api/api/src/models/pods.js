"use strict";
module.exports = (sequelize, DataTypes) => {
  const Pod = sequelize.define(
    "Pod",
    {
      name: {
        type: DataTypes.STRING,

        unique: true,
        allowNull: false,
      },
    },
    {}
  );

  Pod.associate = function (models) {
    models.Pod.belongsTo(models.Deployment);
  };
  return Pod;
};
