const express = require("express");
const multer = require("multer");
const {
  getFileList,
  searchProof,
  uploadFile,
  createFolder,
  getFileFromFolder,
  postDeleteFile,
  getDataFromFile,
  updateFolder,
  removeDirectory,
  getAllDocumentByRole,
  changeFileLocation,
  modifyProofData,
  getInfoOneFileById
} = require("../controller/ProofController");

const router = express.Router();

router.route("/upload/:id").post(uploadFile);

router.route("/createDir").post(createFolder);

router.route("/deleteFile/:id").delete(postDeleteFile);

router.route("/deleteFolder/:id").delete(removeDirectory);

router.route("/updateFolder/:id").put(updateFolder);

router.route("/fileList").get(getFileList);

router.route("/fileList/:id").get(getFileFromFolder);

router.route("/fileData/:id").get(getDataFromFile);

router.route("/getAllDocumentByRole/:id").get(getAllDocumentByRole);

router.route("/changeFileLocation").put(changeFileLocation);

router.route("/modifyProofData/:id").put(modifyProofData);

router.route("/search/:id").post(searchProof);

router.route("/getInfoOneFileById/:id").get(getInfoOneFileById);

module.exports = router;
