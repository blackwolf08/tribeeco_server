'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numberofposts:{
        type:Sequelize.INTEGER,
        defaultValue:0
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      last_name: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      email: {
        type: Sequelize.STRING, 
        unique:true,
        allowNull: false,
        validate:{
          isEmail: true,
          notEmpty: true}
      },
      password: {
        type: Sequelize.STRING
      },
      phone:{
        type:Sequelize.STRING,
        unique:true
      },
      location:{
        type: Sequelize.STRING
      },
      fullname:{
        type: Sequelize.STRING,
      },
      username:{
        type:Sequelize.STRING,
        unique:true,
        allowNull:false,
        validate:{
          notEmpty:true
        }
      },
      passion:{
        type: Sequelize.STRING
      },
      subpassion:{
        type:Sequelize.ARRAY(Sequelize.STRING)
        },
      about:{
        type: Sequelize.STRING
      },
      dob:Sequelize.STRING,
      website:Sequelize.STRING,
      experience:Sequelize.JSONB,
      links:Sequelize.JSONB,
      googleId:Sequelize.STRING,
      profilepic:Sequelize.STRING,
      resetPasswordToken:Sequelize.STRING,
      resetPasswordExpires:Sequelize.STRING,
      objectives:{
        type:Sequelize.ARRAY(Sequelize.STRING)
        },
      associations:{
        type:Sequelize.STRING
      },
      country:{
        type:Sequelize.STRING
      },
      badges:{
        type:Sequelize.ARRAY(Sequelize.STRING)
      },
      rating:{
        type:Sequelize.FLOAT
      },
      gender:{
        type: Sequelize.ENUM('male', 'female'),
        validate:{
          isIn: [['male', 'female']]}
      },
      Professional_Headline:{
        type:Sequelize.STRING
      },
      onboarding: {
        type: Sequelize.BOOLEAN,
        default:false
      },
      interests:{
        type:Sequelize.ARRAY(Sequelize.STRING)
      },
      tribe:{
        type:Sequelize.STRING
        // allowNull: true,
        // validate:{
        //   isIn: [['Design','Frontend','Backend','Singing','Dancing','Content-Writing']]}
      },
      createdAt: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: 'TIMESTAMP'
      },
      updatedAt: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: 'TIMESTAMP'
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};