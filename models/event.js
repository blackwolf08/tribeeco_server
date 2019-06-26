"use strict";
module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define(
    "event",
    {
      eventName: DataTypes.STRING,
      date: DataTypes.DATE,
      duration: DataTypes.INTEGER,
      venue: DataTypes.STRING,
      about: DataTypes.STRING,
      tags: [DataTypes.STRING],
      host: DataTypes.ARRAY(DataTypes.JSONB),
      cohost: DataTypes.ARRAY(DataTypes.JSONB),
      schedule: DataTypes.ARRAY(DataTypes.JSONB),
      link: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      published: DataTypes.BOOLEAN,
      image:DataTypes.STRING
    },
    {}
  );
  event.associate = function(models) {
  };
  return event;
};
