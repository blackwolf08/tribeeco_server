"use strict";

module.exports = (sequelize, DataTypes) => {
  const project = sequelize.define(
    "project",
    {
      body: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      projectname: DataTypes.STRING,
      memberQuantity: DataTypes.INTEGER,
      file: DataTypes.STRING,
      // members:DataTypes.ARRAY(DataTypes.JSONB),
      vision: DataTypes.STRING,
      stage: [DataTypes.STRING],
      schedule: DataTypes.ARRAY(DataTypes.JSONB),
      tags: [DataTypes.STRING],
      socialLinks: DataTypes.ARRAY(DataTypes.JSONB),
      resources: [DataTypes.STRING]
      // description:DataTypes.ARRAY(DataTypes.JSONB)
    },
    {
      classMethods: {
        associate: function(models) {
          project.belongsTo(models.user, { foreignKey: "userId" });
          project.hasMany(models.projectmember);
        }
      }
    }
  );
  return project;
};
