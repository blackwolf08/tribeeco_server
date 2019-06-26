'use strict';
const models=require('../models')
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    body: DataTypes.STRING,
    userId:DataTypes.INTEGER,
    postId:DataTypes.INTEGER
  }, {
    classMethods:{
      associate :function(models) {
        comment.belongsTo(models.user,{as:'user',foreignKey:'userId'});
        comment.belongsTo(models.post,{as:'post',foreignKey:'postId'});
         // associations can be defined here
      }
    }
  });
  return comment;
};