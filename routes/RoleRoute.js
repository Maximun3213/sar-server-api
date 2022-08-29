const express = require("express");
const { roleRegister } = require("../controller/RoleController");

const router = express.Router();

router.route("/role").post(roleRegister);

module.exports = router;
