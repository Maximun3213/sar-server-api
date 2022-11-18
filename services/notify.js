const Notification = require("../models/notificationModel");
let onlineUsers = [];

const addNewUser = (idUser, socketId) => {
  !onlineUsers.some((user) => user.idUser === idUser) &&
    onlineUsers.push({ idUser, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (idUser) => {
  return onlineUsers.find((user) => user.idUser === idUser);
};

class SocketServices {
  connection(socket) {

    socket.on("newUser", (idUser) => {
      addNewUser(idUser, socket.id);
    });

    socket.on("sendNotification", async ({receiverID}) => {
      const receiver = getUser(receiverID);
      if(receiver){
        await Notification.find({ receiver: receiver.idUser }).exec((err, notification) => {
          if (err) return res.send(err);
          _io.to(receiver.socketId).emit("getNotification", notification);
        });
      }
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  }
}

module.exports = new SocketServices();
