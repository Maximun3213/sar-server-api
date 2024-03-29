const express = require("express");
const {
  createCriteria,
  creatChapter,
  creatPart,
  createTreeStructure,
  getTreeStructure,
  removeCriteria,
  modifyCriteria,
  checkUserExist,
  addNewContent
} = require("../controller/TableContentController");

const router = express.Router();

router.route("/createPart").post(creatPart);

router.route("/createChapter").post(creatChapter);

router.route("/createTreeStructure").post(createTreeStructure);

router.route("/getTreeStructure/:id").get(getTreeStructure);

router.route("/createCriteria").post(createCriteria);

router.route("/removeCriteria/:id").delete(removeCriteria);

router.route("/modifyCriteria/:id").put(modifyCriteria);

router.route("/addNewContent").put(addNewContent);

router.route("/checkUserExist").post(checkUserExist);

module.exports = router;
