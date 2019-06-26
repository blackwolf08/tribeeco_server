'use strict';
const models=require('../models')
module.exports = (sequelize, DataTypes) => {
  const post = sequelize.define('post', {
    body: DataTypes.TEXT,
    title: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    picture:DataTypes.STRING,
    tags:DataTypes.ARRAY(DataTypes.STRING),
    link:DataTypes.JSONB,
    linkPreview:DataTypes.BOOLEAN
  }, { classMethods:{
    associate:function(models) {
      post.belongsTo(models.user);
      post.hasMany(models.like);
      post.hasMany(models.comment);
 // associations can be defined here
    }
  }});

  return post;
};