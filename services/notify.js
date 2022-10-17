class SocketServices {

  connection(socket){
    socket.on('disconnect',()=>{
      console.log(`User disconnect id is ${socket.id}`)
    })

    //on
    socket.on('send_notify', (mess)=>{
      console.log(mess)
      _io.emit('receive_notify', mess)
    })
  }
}

module.exports = new SocketServices();