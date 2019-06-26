"use strict";

module.exports = (sequelize, DataTypes) => {
  var message = sequelize.define(
    "message",
    {
      text: DataTypes.STRING,
      user: DataTypes.JSON,
      createdAt: DataTypes.DATE,
      file: DataTypes.STRING
    },
    {}
  );
  message.createMessage = (text, sender, receiver) => {
    return Promise.all([
      message.create({
        text,
        user: {
          _id: sender.id,
          name: sender.name
        }
      }),
      sequelize.models.conversation.findOrCreateConversation(
        sender.id,
        receiver.id
      )
    ]).then(([message, conversation]) => message.setConversation(conversation));
  };
  return message;
};
