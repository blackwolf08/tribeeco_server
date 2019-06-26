"use strict";
module.exports = (sequelize, DataTypes) => {
  const EventHost = sequelize.define(
    "eventhost",
    {
      role: DataTypes.STRING,
      eventId:DataTypes.INTEGER,
      eventHostId:DataTypes.INTEGER,
      hostId:DataTypes.INTEGER
    },
    {}
  );
  return EventHost;
};
