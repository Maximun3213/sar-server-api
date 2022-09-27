const express = require("express");
const multer = require("multer");
// const { getFileList, uploadFile, searchProof } = require("../controller/ProofController");
const {
  getFileList,
  uploadFile,
  createFolder,
  getFileFromFolder,
  postDeleteFile,
  getDataFromFile,
  getProofFolderById,
  updateFolder,
  removeDirectory,
} = require("../controller/ProofController");

const router = express.Router();

router.route("/upload").post(uploadFile);
router.route("/createDir").post(createFolder);
router.route("/deleteFile/:id").post(postDeleteFile);
router.route("/folder/:id").delete(removeDirectory);

router.route("/updateFolder/:id").put(updateFolder);

router.route("/fileList").get(getFileList);
router.route("/fileList/:id").get(getFileFromFolder);
router.route("/fileData/:id").get(getDataFromFile);
router.route("/proofFolder/:id").get(getProofFolderById);
// router.route("/search/:key").get(searchProof);

module.exports = router;
