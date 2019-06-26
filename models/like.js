'use strict';
const models=require('../models')
module.exports = (sequelize, DataTypes) => {
  const like = sequelize.define('like', {
    status: DataTypes.BOOLEAN,
    userId:DataTypes.INTEGER,
    postId:DataTypes.INTEGER
  }, {
    classMethods:{
      associate:function(models) {
        // like.belongsTo(models.user);
        // like.belongsTo(models.post); 
        like.belongsTo(models.user,{as:'user',foreignKey:'userId'});
        like.belongsTo(models.post,{as:'post',foreignKey:'postId'});// associations can be defined here
      }
    }
  });
  return like;
};