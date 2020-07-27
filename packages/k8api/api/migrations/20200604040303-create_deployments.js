"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Deployments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      name: {
        type: Sequelize.STRING,

        unique: true,

        allowNull: false,
      },
      NamespaceId: {
        type: Sequelize.INTEGER,

        allowNull: false,
        references: {
          model: "Namespaces",
          key: "id",
        },
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Deployments");
  },
};
