const express = require("express");
const {
  createSar,
  createSarFolder,
  getAllSarFiles,
  removeSarFile,
  modifySarData,
  getDataFromSarFile,
  addMemberToSar,
  deleteMemberOfSar,
  getAllUserFromSar,
  grantWritingRole
} = require("../controller/SarController");

const router = express.Router();

router.route("/createSar").post(createSar);

router.route("/createSarFolder").post(createSarFolder);

router.route("/getAllSarFiles").get(getAllSarFiles);

router.route("/removeSarFile/:id").delete(removeSarFile);

router.route("/modifySarData/:id").put(modifySarData);

router.route("/getDataFromSarFile/:id").get(getDataFromSarFile);

router.route("/addMemberToSar").post(addMemberToSar);

router.route("/deleteMemberOfSar/:id/:userID").delete(deleteMemberOfSar);

router.route("/getAllUserFromSar/:id").get(getAllUserFromSar);

router.route("/grantWritingRole").put(grantWritingRole);


module.exports = router;
