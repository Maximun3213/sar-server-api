const express = require("express");
const {
  createSar,
  createSarFolder,
  getAllSarFiles,
  removeSarFile,
  modifySarData,
  getDataFromSarFile,
} = require("../controller/SarController");

const router = express.Router();

router.route("/createSar").post(createSar);

router.route("/createSarFolder").post(createSarFolder);

router.route("/getAllSarFiles").get(getAllSarFiles);

router.route("/removeSarFile/:id").delete(removeSarFile);

router.route("/modifySarData/:id").put(modifySarData);

router.route("/getDataFromSarFile/:id").get(getDataFromSarFile);


module.exports = router;
