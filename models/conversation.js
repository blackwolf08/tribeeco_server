"use strict";

const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const conversation = sequelize.define("conversation", {}, {});
  conversation.findOrCreateConversation = (user1Id, user2Id) => {
    return conversation
      .findOne({
        where: {
          user1Id: {
            [Sequelize.Op.or]: [user1Id, user2Id]
          },
          user2Id: {
            [Sequelize.Op.or]: [user1Id, user2Id]
          }
        },
        include: [sequelize.models.message],
        order: [[sequelize.models.message, "createdAt", "ASC"]]
      })
      .then(conversation_ => {
        if (conversation_) {
          return conversation_;
        } else {
          return conversation.create({
            user1Id: user1Id,
            user2Id: user2Id
          });
        }
      });
  };
  return conversation;
};
