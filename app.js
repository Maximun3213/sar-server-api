const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const app = express();

const cors = require("cors");

app.use(express.static("uploads"));
app.use(express.json());
app.use(cors());

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


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

app.use("/api/user", user);
app.use("/api/role", role);
app.use("/api/permission", permission);
app.use("/api/proofStore", proof);
app.use("/api/sar", sar);
app.use("/api/tableOfContent", tableOfContent);

module.exports = server;
