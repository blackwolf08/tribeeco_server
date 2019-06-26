'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var config = require('../config.json');
var db = {};
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize('name_it', 'postgres', '123', {
    host: '127.0.0.1',
    dialect: 'postgres'
  });
}

fs.readdirSync(__dirname)
  .filter(function(file) {
    return file.indexOf('.') !== 0 && file !== basename;
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.post.belongsTo(db.user);
db.user.hasMany(db.post);
db.like.belongsTo(db.post);
db.like.belongsTo(db.user);
db.user.hasMany(db.like);
db.post.hasMany(db.like);
db.comment.belongsTo(db.post);
db.post.hasMany(db.comment);
db.comment.belongsTo(db.user);
db.user.hasMany(db.comment);
db.eventcomment.belongsTo(db.user);
db.user.hasMany(db.eventcomment);
db.interested.belongsTo(db.event);
db.interested.belongsTo(db.user);
db.user.hasMany(db.interested);
db.event.hasMany(db.interested);
db.event.hasMany(db.eventcomment);
db.eventcomment.belongsTo(db.event);

// db.event.belongsTo(db.user);
// db.user.hasMany(db.event);
// db.event.hasMany(db.user, { as: "hosts" });
// db.event.hasMany(db.user, { as: "cohosts" });

db.event.belongsToMany(db.user, {
  through: db.eventhost,
  as: 'hosts',
  foreignKey: 'eventHostId'
});
db.user.belongsToMany(db.event, {
  through: db.eventhost,
  foreignKey: 'hostId'
});

db.project.belongsTo(db.user);
db.user.hasMany(db.project);
db.projectmember.belongsTo(db.user);
db.projectmember.belongsTo(db.project);
db.user.hasMany(db.projectmember);
db.project.hasMany(db.projectmember);

db.conversation.belongsTo(db.user, { as: 'user1', foreignKey: 'user1Id' });
db.conversation.belongsTo(db.user, { as: 'user2', foreignKey: 'user2Id' });

db.message.belongsTo(db.conversation);
db.conversation.hasMany(db.message);

// db.user.belongsToMany(db.connection,{:'senderId'});
// db.user.hasMany(db.connection,{foreignKey:'receiverId'});
// db.connection.hasMany(db.user);
// db.connection.hasMany(db.user,{foreignKey:'receiverId'});
// db.connection.belongsTo(db.user);
// db.user.hasMany(db.connection);
// db.like.belongsTo(db.user,{as:'user',foreignKey:'userId'})
// db.like.belongsTo(db.post,{as:'post',foreignKey:'postId'})
// db.like.belongsTo(db.user);
// db.user.hasMany(db.like);

module.exports = db;
