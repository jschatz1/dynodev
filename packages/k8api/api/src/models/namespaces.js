"use strict";
module.exports = (sequelize, DataTypes) => {
  const Namespace = sequelize.define(
    "Namespace",
    {
      name: {
        type: DataTypes.STRING,

        unique: true,
        allowNull: false,
      },
    },
    {}
  );

  Namespace.associate = function (models) {
    models.Namespace.hasMany(models.Deployment);

    models.Namespace.hasMany(models.Pod);
  };
  return Namespace;
};
