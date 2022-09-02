const express = require("express");
const { userLogin, userList, userRegister } = require("../controller/UserController");
const { authenToken } = require('../middleware/verifyToken');

const router = express.Router();

// PATHS
router.route("/login").post(userLogin);

router.route("/userList").get(userList)

router.route("/registration").post(userRegister)

module.exports = router;
