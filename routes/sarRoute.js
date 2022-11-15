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
  grantWritingRole,
  removeWritingRole,
  getFileFromSarFolder,
  previewSar,
  getPublishedSar
} = require("../controller/SarController");

const router = express.Router();

router.route("/createSar").post(createSar);

router.route("/createSarFolder").post(createSarFolder);

router.route("/getAllSarFiles").get(getAllSarFiles);

router.route("/removeSarFile/:id").delete(removeSarFile);

router.route("/modifySarData/:id").put(modifySarData);

router.route("/getDataFromSarFile/:id").get(getDataFromSarFile);

router.route("/addMemberToSar").post(addMemberToSar);

router.route("/deleteMemberOfSar/:sarID/:userID/:senderID").delete(deleteMemberOfSar);

router.route("/getAllUserFromSar/:id").get(getAllUserFromSar);

router.route("/grantWritingRole").put(grantWritingRole);

router.route("/removeWritingRole").post(removeWritingRole);

router.route("/getFileFromSarFolder/:type/:id").get(getFileFromSarFolder);

router.route("/previewSar/:id").get(previewSar);

router.route("/getPublishedSar").get(getPublishedSar);


module.exports = router;
