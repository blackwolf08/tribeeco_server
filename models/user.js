"use strict";
const models = require("../models");
module.exports = function(sequelize, Sequelize) {
  var User = sequelize.define(
    "user",
    {
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      resetPasswordToken: Sequelize.STRING,
      resetPasswordExpires: { type: "TIMESTAMP" },
      googleId: Sequelize.STRING,
      profilepic: Sequelize.STRING,
      password: Sequelize.STRING,
      location: Sequelize.STRING,
      fullname: Sequelize.STRING,
      phone: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isNumeric: {
            msg: "must be numeric"
          },
          len: {
            args: [10, 12]
          }
        }
      },
      onboarding: {
        type: Sequelize.BOOLEAN,
        default: false
      },
      dob:{type:Sequelize.STRING},
      website:{type:Sequelize.STRING},
      experience:{type:Sequelize.JSONB},
      tribe: Sequelize.STRING,
      gender: {type:Sequelize.STRING},
      passion: {type:Sequelize.STRING},
      numberofposts: { type: Sequelize.INTEGER, defaultValue: 0 },
      subpassion: Sequelize.ARRAY(Sequelize.STRING),
      associations: Sequelize.STRING,
      country: Sequelize.STRING,
      rating: Sequelize.FLOAT,
      links: Sequelize.JSONB,
      Professional_Headline: Sequelize.STRING,
      interests: Sequelize.ARRAY(Sequelize.STRING),
      objectives: Sequelize.ARRAY(Sequelize.STRING),
      about: Sequelize.STRING,
      badges: Sequelize.ARRAY(Sequelize.STRING)
    },
    {
      classMethods: {
        associate: function(models) {
          User.hasMany(models.comment);
          User.hasMany(models.like);
          User.hasMany(models.interested);
          User.hasMany(models.eventcomment)
          User.hasMany(models.post);
          User.hasMany(models.session);
          User.hasMany(models.project, { as: "project" });
          User.hasMany(models.projectmember);
        }
      }
    }
  );

  User.prototype.toJSON = function() {
    var values = Object.assign({}, this.get());

    delete values.password;
    delete values.googleId;
    delete values.resetPasswordExpires;
    delete values.resetPasswordToken;
    return values;
  };
  return User;
};
