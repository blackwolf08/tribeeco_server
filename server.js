require("dotenv").config();
const app = require("./app");
const http = require("http");
var server = http.createServer(app);
const socketIO = require("socket.io");
var io = socketIO(server);
var models = require("./models");
const mobileSockets = {};

const port = process.env.PORT | 8000;

io.on("connection", socket => {
  socket.on("chat", users => {
    mobileSockets[users.user.id] = socket.id;
    models.conversation
      .findOrCreateConversation(users.user.id, users.receiver.id)
      .then(conversation => {
        socket.emit("priorMessages", conversation.messages);
      });
  });

  socket.on("message", ({ text, sender, receiver }) => {
    models.message.createMessage(text, sender, receiver).then(message => {
      const receiverSocketId = mobileSockets[receiver.id];
      socket.to(receiverSocketId).emit("incomingMessage", message);
    });
  });
});

server.listen(port, function() {
  console.log("Server running at port " + port);
});
