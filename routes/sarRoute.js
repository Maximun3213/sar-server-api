const express = require("express");
const { createSar, createSarFolder } = require("../controller/SarController");

const router = express.Router();

router.route("/createSar").post(createSar)

router.route("/createSarFolder").post(createSarFolder)

module.exports = router;
