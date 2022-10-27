const User = require("../models/usersModel");
const Role = require("../models/rolesModel");
const { proofFolder, proofFile } = require("../models/proofsModel");
const { SarFile } = require("../models/sarModel");
const { setNotification } = require("../middleware/notification");

const jwt = require("jsonwebtoken");
const json = require("body-parser");
const { ObjectId } = require("mongodb");
const { populate } = require("../models/rolesModel");
const Notification = require("../models/notificationModel");
const sendMail = require("../utils/sendMail.js");
const crypto = require("crypto");

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  //Kiểm tra email có tồn tại hay chưa
  const user = await User.findOne({ email });
  const role = await Role.findById(user.roleID);

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Email không đúng" });

  //KIểm tra password có đúng hay không bằng cách hash password
  const isPasswordMatched = await user.comparedPassword(password);

  if (!isPasswordMatched)
    return res.status(400).json({
      success: false,
      message: "Sai mật khẩu",
    });

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

  if (role != null) {
    const permission = await Role.findById(role._id)
      .populate("permissionID")
      .exec();

    if (role.roleID === "ADMIN") {
      const IdFolderRoot = await proofFolder
        .findOne({ parentID: null })
        .select("_id");

      return res.send({
        user,
        role,
        permission,
        token,
        IdFolderRoot,
      });
    }

    res.send({
      user,
      role,
      permission,
      token,
    });
  }

  res.send({
    user,
    // role,
    // permission,
    token,
  });

  //Nếu đúng thì tạo và gửi token về client
};

exports.userList = (req, res) => {
  User.find({})
    .select("_id cbID fullName email creatAt department")
    .populate({
      path: "roleID",
      select: "roleName roleID",
    })
    .exec((err, users) => {
      if (err) {
        console.log(err);
      } else {
        res.send(users);
      }
    });
};

exports.getUserById = (req, res) => {
  User.find({ _id: req.params.id })
    .select("_id cbID fullName email creatAt department")
    .populate({
      path: "roleID",
      select: "roleName roleID",
    })
    .exec((err, users) => {
      if (err) {
        console.log(err);
      } else {
        res.send(users);
      }
    });
};

exports.updateUserById = (req, res) => {
  const { cbID, fullName, email, department } = req.body;
  User.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        cbID: cbID,
        fullName: fullName,
        email: email,
        department: department,
      },
    }
  ).exec((err, result) => {
    if (err) {
      console.log(err);
    }
    return res.send("Cập nhật thông tin thành công");
  });
};

exports.deleteUserById = (req, res) => {
  User.findByIdAndDelete({ _id: req.params.id }).exec((err, result) => {
    if (err) {
      console.log(err);
    }
    return res.send("Xoá thành công");
  });
};

//test đăng ký user
exports.userRegister = async (req, res) => {
  const { cbID, fullName, roleID, email, password, department } = req.body;

  const user = await User.create({
    cbID,
    fullName,
    roleID,
    email,
    password,
    department,
  });
  res.status(200).json({
    success: true,
    message: "Tạo tài khoản thành công",
  });
};

exports.changePassword = async (req, res, next) => {
  const user = await User.findById(req.params.id).select("password");
  const isPasswordMatched = await user.comparedPassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return res.status(400).send("Mật khẩu cũ không chính xác");
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    // return next(new ErrorHandler("Password not matched each other", 400));
    return res.status(400).send("Mật khẩu mới không khớp");
  }
  user.password = req.body.newPassword;
  await user.save();
  return res.status(200).send("Đổi mật khẩu thành công");
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("Email không tồn tại");

  //Get refreshToken
  const refreshToken = user.getRefreshToken();
  await user.save({
    validateBeforeSave: false,
  });
  //http://4000

  // const URl = "http://localhost:3000";
  const URl = "https://sar-fe.vercel.app";

  const resetPasswordUrl = `${URl}/resetPassword/${refreshToken}`;
  const message = `Your password refresh token is: \n\n ${resetPasswordUrl}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Confirm password recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    console.log("Catch block");

    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;

    await user.save({
      validateBeforeSave: false,
    });
    return next(error);
  }
};

//getNewPassword
exports.resetPassword = async (req, res, next) => {
  //create hash token
  const resetPasswordToken = crypto
    .createHmac("sha256", "key")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTime: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .send("Reset Password URL is invalid or has been expired");
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).send("Password not matched");
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTime = undefined;

  await user.save();
  return res.status(200).send("Cập nhập mật khẩu thành công");
};

// List MP user
exports.getAllProofManager = async (req, res, next) => {
  const user = await User.find({ roleID: "630a2454b6a1b1e909a16431" })
    .select("cbID fullName")
    .exec(function (err, users) {
      if (err) {
        return res.send(err);
      }
      res.send(users);
    });
};
//grantProofPermission
exports.grantProofKey = async (req, res, next) => {
  const filter = { _id: req.body.id };
  const checkProofStoreExist = await User.findById(req.body.id);
  const roleMP = await Role.find({ roleID: "MP" });

  if (!checkProofStoreExist.proofStore.includes(req.body.proofStore)) {
    return proofFolder
      .aggregate([
        {
          $match: {
            _id: ObjectId(req.body.proofStore),
          },
        },
        {
          $graphLookup: {
            from: "proof_folders",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parentID",
            as: "children",
            maxDepth: 4,
            depthField: "level",
            restrictSearchWithMatch: {},
          },
        },
        {
          $project: {
            "children._id": 1,
            "children.title": 1,
          },
        },
      ])
      .then((data) => {
        roleMP.map((result) => {
          User.findByIdAndUpdate(filter, {
            $push: { proofStore: req.body.proofStore },
            $set: {
              roleID: ObjectId(result._id),
            },
          }).exec();
        });
        proofFolder
          .findByIdAndUpdate(req.body.proofStore, {
            $push: {
              user_access: req.body.id,
            },
          })
          .exec();

        return res.send("Grant key successfully");
      });
  }
  return res.status(400).json({
    success: false,
    message: "Thư mục đã được cấp quyền",
  });
};

//get proofStore API

exports.getProofStore = async (req, res, next) => {
  await User.findById(req.params.id)
    .select("proofStore")
    .exec((data, err) => {
      if (err) {
        return res.send(err);
      }
      res.send(data);
    });
};
//get all  data for each MP
exports.getAllDataForEachMP = async (req, res) => {
  const role = await Role.find({ roleID: "MP" });
  role.map((item) => {
    User.find({ roleID: item._id })
      .select("cbID fullName email")
      .populate([
        {
          path: "proofStore",
          select: "title parentID",
        },
        {
          path: "roleID",
          select: "roleName",
        },
      ])
      .exec((err, users) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json({
            users,
          });
        }
      });
  });
};

//
exports.getListUserAccessFromFolder = async (req, res) => {
  const folderID = req.params;
  const roleName = await proofFolder;
  await proofFolder
    .aggregate([
      {
        $match: {
          _id: ObjectId(folderID),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_access",
          foreignField: "_id",
          as: "storage",
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          "storage._id": 1,
          "storage.cbID": 1,
          "storage.email": 1,
          "storage.fullName": 1,
          "storage.roleID": 1,
        },
      },
    ])
    .exec((err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
};

// Xóa quyền trên thư mục

exports.removeProofKey = async (req, res, next) => {
  //----
  try {
    const { fid, uid } = req.params;

    proofFolder
      .updateMany(
        { _id: ObjectId(fid) },
        {
          $pull: {
            user_access: uid,
          },
        }
      )
      .exec((err, result) => {
        if (err) {
          console.log(err);
        }
        User.updateMany(
          { _id: ObjectId(uid) },
          {
            $pull: {
              proofStore: fid,
            },
            $set: {
              roleID: null,
            },
          }
        ).exec((err, result) => {
          if (err) {
            console.log(err);
          }
          return res.send("Xoá thành công");
        });
      });
  } catch (error) {
    // This is where you handle the error
    res.status(500).send(error);
  }
};

//API for MS user

exports.grantRoleMS = async (req, res) => {
  const { userID, senderID, receiveID, sarID, createAt } = req.body;
  const user = await User.findOne({ _id: req.body.userID });
  const roleMS = await Role.find({ roleID: "MS" });
  const sar = await SarFile.findOne({ _id: sarID });

  roleMS.map((result) => {
    User.updateOne(
      { _id: userID, roleID: null },
      {
        $set: {
          roleID: ObjectId(result._id),
        },
      }
    ).exec((err, result) => {
      const content = `Bạn đã được cấp quyền quản trị quyển Sar "${sar.title}"`;

      if (err) {
        console.log("Cannot update this field");
      }
      SarFile.updateOne(
        { _id: sarID },
        {
          $set: {
            user_manage: userID,
          },
        }
      ).exec();
      setNotification(senderID, userID, createAt, content);
      res.send(`Cấp quyền cho người dùng "${user.fullName}" thành công`);
    });
  });
};

exports.getAllUserMS = async (req, res) => {
  const roleMS = await Role.findOne({ roleID: "MS" });

  await User.aggregate([
    {
      $match: {
        roleID: roleMS._id,
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleID",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $unwind: "$role",
    },
    {
      $lookup: {
        from: "sar_files",
        localField: "_id",
        foreignField: "user_manage",
        as: "mySar",
      },
    },
    {
      $unwind: "$mySar",
    },
  ]).exec((err, result) => {
    res.send(result);
  });
};

exports.removeRoleMS = async (req, res) => {
  const { senderID, receiveID, sarID, createAt } = req.body;
  const sar = await SarFile.findOne({ _id: sarID });
  await User.updateOne(
    { _id: req.params.id },
    {
      $set: {
        roleID: null,
      },
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
      SarFile.updateOne(
        { user_manage: req.params.id },
        {
          $set: {
            user_manage: null,
          },
        }
      ).exec((err) => {
        const content = `Bạn đã bị xóa quyền quản trị của quyển SAR "${sar.title}"`;

        if (err) console.log(err);
        setNotification(senderID, receiveID, createAt, content);
        res.send("Xóa thành công");
      });
    }
  ).clone();
};

exports.getAllUserRoleNull = async (req, res) => {
  const roleNull = await User.find({ roleID: null }).exec();
  if (roleNull) {
    return res.send(roleNull);
  } else {
    return res.send("No data user");
  }
};

//API handle notification for each user
exports.getNotificationByID = async (req, res, next) => {
  try {
    await Notification.find({ receiver: req.params.id }).exec(
      (err, notification) => {
        if (err) return res.send(err);
        res.status(200).json({
          success: true,
          notification,
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.removeNotification = async (req, res, next) => {
  try {
    await Notification.deleteOne({ _id: req.params.id }).exec((err) => {
      if (err) return res.send(err);
      res.send("Đã xóa 1 thông báo");
    });
  } catch (error) {
    console.log(error);
  }
};

exports.checkIsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { _id: req.params.id },
      { $set: { is_read: true } }
    ).exec((err) => {
      if (err) console.log(err);
      res.send("Đã xem");
    });
  } catch (error) {
    console.log(error);
  }
};
