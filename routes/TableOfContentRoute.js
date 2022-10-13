const express = require("express");
const {
  createCriteria,
  creatChapter,
  creatPart,
  createTreeStructure,
  getTreeStructure,
  removeCriteria
} = require("../controller/TableContentController");

const router = express.Router();

router.route("/createCriteria").post(createCriteria);

router.route("/createChapter").post(creatChapter);

router.route("/createPart").post(creatPart);

router.route("/createTreeStructure").post(createTreeStructure);

router.route("/getTreeStructure/:id").get(getTreeStructure);

router.route("/removeCriteria/:id").delete(removeCriteria);

module.exports = router;
