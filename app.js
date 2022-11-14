const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bodyParser = require('body-parser')

const app = express();


const cors = require("cors");

app.use(express.static("uploads"));
app.use(express.json({limit: '50mb'}));
app.use(cors());
// app.use(bodyParser({limit: '50mb'}));


//socket library
const  http  =  require('http').Server(app);
const  io  =  require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});

const  SocketServices  =  require('./services/notify')
global._io  =  io;
global._io.on('connection',  SocketServices.connection)

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

//Route import
const user = require("./routes/UserRoute");
const role = require("./routes/RoleRoute");
const permission = require("./routes/PermissionRoute");
const proof = require("./routes/ProofRoute");
const sar = require("./routes/sarRoute");
const tableOfContent = require("./routes/TableOfContentRoute");
const { ObjectId } = require("mongodb");

app.use("/api/user", user);
app.use("/api/role", role);
app.use("/api/permission", permission);
// app.use("/api/proofStore", proof);
app.use("/api/sar", sar);
app.use("/api/tableOfContent", tableOfContent);

module.exports = http;
