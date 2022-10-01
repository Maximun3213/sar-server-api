const User = require("../models/usersModel");
const Role = require("../models/rolesModel");
const { proofFolder } = require("../models/proofsModel");

const jwt = require("jsonwebtoken");
const json = require("body-parser");
const { ObjectId } = require("mongodb");

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  //Kiểm tra email có tồn tại hay chưa
  const user = await User.findOne({ email });
  const role = await Role.findById(user.roleID);

  const permission = await Role.findById(role._id)
    .populate("permissionID")
    .exec();

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Email not matched" });

  //KIểm tra password có đúng hay không bằng cách hash password
  const isPasswordMatched = await user.comparedPassword(password);

  if (!isPasswordMatched)
    return res.status(400).json({
      success: false,
      message: "Invalid password",
    });

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

  const IdFolderRoot = await proofFolder
    .findOne({ parentID: null })
    .select("_id");

  if (role.roleID === "ADMIN") {
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

  //Nếu đúng thì tạo và gửi token về client
};

exports.userList = (req, res) => {
  User.find({}, (err, result) => {
    res.send(result);
  });
};

//test đăng ký user
exports.userRegister = async (req, res) => {
  const { cbID, fullName, roleID, email, password } = req.body;

  const user = await User.create({
    cbID,
    fullName,
    roleID,
    email,
    password,
  });
  res.status(200).json({
    success: true,
    message: "Create user successfully",
  });
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
        data.forEach((child) => {
          child.children.forEach((childList) => {
            User.findByIdAndUpdate(filter, {
              $push: {
                proofStore: childList._id,
              },
            }).exec();
          });
        });
        User.findByIdAndUpdate(filter, {
          $push: { proofStore: req.body.proofStore },
        }).exec();
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
