'use strict';
module.exports = (sequelize, DataTypes) => {
  const eventcomment = sequelize.define('eventcomment', {
    body: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER
  }, {});
  eventcomment.associate = function(models) {
    eventcomment.belongsTo(models.user,{as:'user',foreignKey:'userId'});
    eventcomment.belongsTo(models.post,{as:'event',foreignKey:'eventId'});
    // associations can be defined here
  };
  return eventcomment;
};