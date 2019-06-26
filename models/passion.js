'use strict';
module.exports = (sequelize, DataTypes) => {
  const passion = sequelize.define('passion', {
    passion:{
      type:DataTypes.STRING,
      unique:true,
      allowNull:false,
      validate:{
        notEmpty:true
      },
    },
    tribe:DataTypes.STRING,
    subpassion: DataTypes.ARRAY(DataTypes.STRING)
  }, {});
  passion.associate = function(models) {
    // associations can be defined here
  };
  return passion;
};