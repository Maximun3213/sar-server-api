const express = require("express");
const { userLogin, userList } = require("../controller/UserController");
const { authenToken } = require('../middleware/verifyToken');

const router = express.Router();

// PATHS
router.route("/login").post(userLogin);

router.route("/userList").get(userList)

module.exports = router;
