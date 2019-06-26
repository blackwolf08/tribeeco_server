"use strict";
module.exports = (sequelize, DataTypes) => {
  const interested = sequelize.define(
    "interested",
    {
      status: DataTypes.BOOLEAN,
      userId: DataTypes.INTEGER,
      eventId: DataTypes.INTEGER
    },
    {}
  );
  interested.associate = function(models) {
    interested.belongsTo(models.user, { as: "user", foreignKey: "userId" });
    interested.belongsTo(models.event, { as: "event", foreignKey: "eventId" });
  };
  return interested;
};
