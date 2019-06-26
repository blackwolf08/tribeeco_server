'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventName: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      duration: {
        type: Sequelize.INTEGER
      },
      venue: {
        type: Sequelize.STRING
      },
      about: {
        type: Sequelize.STRING
      },
      image:Sequelize.STRING,
      userId:{
        type: Sequelize.INTEGER
      },
      published:{
        type:Sequelize.BOOLEAN,
        default:false
      },
      tags: {
        type:Sequelize.ARRAY(Sequelize.STRING)
        },
      host: {
        type:Sequelize.ARRAY(Sequelize.JSONB)
        },
      cohost: {
        type:Sequelize.ARRAY(Sequelize.JSONB)
        },
      schedule: {
        type:Sequelize.ARRAY(Sequelize.JSONB)
        },
      link: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: 'TIMESTAMP'
      },
      updatedAt: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: 'TIMESTAMP'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('events');
  }
};