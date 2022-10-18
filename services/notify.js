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
    socket.on("disconnect", () => {
      console.log(`User disconnect id is ${socket.id}`);
      removeUser(socket.id);
    });

    //on
    socket.on("newUser", (idUser) => {
      addNewUser(idUser, socket.id);
      console.log(idUser)
    });

    socket.on("send_notify", ({ receiverID }) => {
      const receiver = getUser(receiverID);
      console.log(receiver.socketId)
      _io.to(receiver.socketId).emit("receive_notify", receiverID);
    });
  }
}

module.exports = new SocketServices();
