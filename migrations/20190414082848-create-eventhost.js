"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("eventhosts", {
      role: {
        type: Sequelize.STRING
      },
      eventHostId:Sequelize.INTEGER,
      hostId:Sequelize.INTEGER,
      eventId:Sequelize.INTEGER
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("eventhosts");
  }
};
