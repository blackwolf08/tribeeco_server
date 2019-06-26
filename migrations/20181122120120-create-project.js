"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("projects", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      file:{
        type:Sequelize.STRING
      },
      projectname: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER
      },
      memberQuantity: {
        type: Sequelize.INTEGER
      },
      members: {
        type: Sequelize.ARRAY(Sequelize.JSONB)
      },
      vision: {
        type: Sequelize.STRING
      },
      socialLinks: {
        type: Sequelize.ARRAY(Sequelize.JSONB)
      },
      stage: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      schedule: {
        type: Sequelize.ARRAY(Sequelize.JSONB)
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      resources: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      createdAt: {
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        type: "TIMESTAMP"
      },
      updatedAt: {
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        type: "TIMESTAMP"
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("projects");
  }
};
