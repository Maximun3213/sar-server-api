const express = require("express");
const multer = require("multer");
const { getFileList, uploadFile, searchProof } = require("../controller/ProofController");

const router = express.Router();

router.route("/upload").post(uploadFile);

router.route("/fileList").get(getFileList);

router.route("/search/:key").get(searchProof);



module.exports = router;
