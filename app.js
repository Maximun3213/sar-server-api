const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer")
const app = express();
var cors = require('cors')
app.use(express.static('uploads'))

app.use(express.json());
app.use(cors());

var corsOptions = {
  origin: 'https://google.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});

//Route import
const user = require("./routes/UserRoute");
const role = require("./routes/RoleRoute");
const permission = require("./routes/PermissionRoute");
const proof = require("./routes/proofRoute");


app.use("/api", user);
app.use("/api", role);
app.use("/api", permission);
app.use("/api",cors(), proof);


module.exports = app;
