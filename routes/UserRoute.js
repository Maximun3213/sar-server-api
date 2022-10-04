const express = require("express");
const {
  userLogin,
  userList,
  userRegister,
  getAllProofManager,
  grantProofKey,
  getProofStore,
  getAllDataForEachMP,
  getListUserAccessFromFolder,
  removeProofKey,
} = require("../controller/UserController");
const { authenToken } = require("../middleware/verifyToken");

const router = express.Router();

// PATHS
router.route("/login").post(userLogin);

router.route("/userList").get(userList);

router.route("/registration").post(userRegister);

router.route("/getAllProofManager").get(getAllProofManager);

router.route("/grantProofKey").put(grantProofKey);

router.route("/proofStore/:id").get(getProofStore)

router.route("/getMPList").get(getAllDataForEachMP)

router.route("/getListUserAccess/:id").get(getListUserAccessFromFolder)

router.route("/removeProofKey/:fid/:uid").delete(removeProofKey)





// router.route("/getOwnStorage/:id").get(getOwnStorage)

module.exports = router;
