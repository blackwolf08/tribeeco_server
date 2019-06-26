'use strict';
const models=require('../models')
module.exports = (sequelize, DataTypes) => {
  const session = sequelize.define('session', {
    token: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        session.belongsTo(models.user,{as:'user',foreignKey:'userId'});
        // associations can be defined here
      }
    }
  });
  return session;
};