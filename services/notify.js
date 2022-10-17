class SocketServices {

  connection(socket){
    socket.on('disconnect',()=>{
      console.log(`user connect ${socket.id}`)
    })
    socket.on('send_notify', (mess)=>{
      console.log(mess)
      _io.emit('receive_notify', mess)
    })
  }
}

module.exports = new SocketServices();