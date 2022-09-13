const express = require("express");
const { permissionRegister } = require("../controller/PermissionController");

const router = express.Router();

router.route("/permission").post(permissionRegister);


module.exports = router;
