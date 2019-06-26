"use strict";
module.exports = (sequelize, DataTypes) => {
  const connection = sequelize.define(
    "connection",
    {
      sent: DataTypes.BOOLEAN,
      senderId: DataTypes.INTEGER,
      receiverId: DataTypes.INTEGER,
      status: { type: DataTypes.BOOLEAN, defaultValue: false },
      createdAt: DataTypes.DATE
    },
    {}
  );
  connection.associate = function(models) {
    connection.belongsTo(models.user, { foreignKey: "senderId" });
  };
  return connection;
};
