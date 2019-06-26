"use strict";
module.exports = (sequelize, DataTypes) => {
  const projectmember = sequelize.define(
    "projectmember",
    {
      userId: DataTypes.INTEGER,
      projectId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      role: DataTypes.STRING,
      createdAt: DataTypes.DATE
    },
    {}
  );
  projectmember.associate = function(models) {
    projectmember.belongsTo(models.user);
    projectmember.belongsTo(models.project);
  };
  return projectmember;
};
