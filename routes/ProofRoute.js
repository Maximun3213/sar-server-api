const express = require("express");
const multer = require("multer");
// const { getFileList, uploadFile, searchProof } = require("../controller/ProofController");
const { getFileList, uploadFile, createFolder, getFileFromFolder } = require("../controller/ProofController");

const router = express.Router();

router.route("/upload").post(uploadFile);
router.route("/createFolder").post(createFolder);
router.route("/createDir").post(createFolder);

router.route("/fileList").get(getFileList);

router.route("/fileList/:id").get(getFileFromFolder)

// router.route("/search/:key").get(searchProof);



module.exports = router;
