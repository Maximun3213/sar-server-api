const express = require("express");
const {
  userLogin,
  userList,
  userRegister,
  getAllProofManager,
  grantProofKey,
  getProofStore,
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

// router.route("/getOwnStorage/:id").get(getOwnStorage)

module.exports = router;
