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
  grantRoleMS,
  getAllUserMS,
  removeRoleMS,
  getAllUserRoleNull,
  getNotificationByID,
  removeNotification
} = require("../controller/UserController");

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

router.route("/getAllUserRoleNull").get(getAllUserRoleNull)



//API for MS USER
router.route("/grantRoleMS").put(grantRoleMS)

router.route("/getAllUserMS").get(getAllUserMS)

router.route("/removeRoleMS/:id").delete(removeRoleMS)

//API for handle notification

router.route("/getNotificationByID/:id").get(getNotificationByID)

router.route("/removeNotification/:id").delete(removeNotification)




// router.route("/getOwnStorage/:id").get(getOwnStorage)

module.exports = router;
