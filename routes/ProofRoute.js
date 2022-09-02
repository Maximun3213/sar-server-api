const express = require("express");
const { getFileList, uploadFile } = require("../controller/ProofController");

const router = express.Router();

router.route("/upload").post(uploadFile);

router.route("/fileList").get(getFileList);



module.exports = router;
