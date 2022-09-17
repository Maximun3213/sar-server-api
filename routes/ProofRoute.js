const express = require("express");
const multer = require("multer");
// const { getFileList, uploadFile, searchProof } = require("../controller/ProofController");
const { getFileList, uploadFile, createFolder, getFileFromFolder, postDeleteFile, getDataFile } = require("../controller/ProofController");

const router = express.Router();

router.route("/upload").post(uploadFile);
router.route("/createDir").post(createFolder)
router.route("/deleteFile/:id").post(postDeleteFile)

router.route("/fileList").get(getFileList);
router.route("/fileList/:id").get(getFileFromFolder)
// router.route("/dataFile/:id").get(getDataFile)
// router.route("/search/:key").get(searchProof);



module.exports = router;
