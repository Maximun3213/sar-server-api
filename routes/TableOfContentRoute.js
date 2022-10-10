const express = require("express");
const { createCriteria, creatChapter, creatPart, createTreeStructure } = require("../controller/TableContentController");

const router = express.Router();

router.route("/createCriteria").post(createCriteria)

router.route("/createChapter").post(creatChapter)

router.route("/createPart").post(creatPart)

router.route("/createTreeStructure").post(createTreeStructure)

module.exports = router;
