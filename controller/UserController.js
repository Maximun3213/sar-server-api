const User = require("../models/usersModel");
const Role = require("../models/rolesModel");
const Proof = require("../models/proofsModel");

const jwt = require("jsonwebtoken");
const json = require("body-parser");

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  //Kiểm tra email có tồn tại hay chưa
  const user = await User.findOne({ email });
  const role = await Role.findById(user.roleID);
  const IdFolderRoot = await Proof.findOne({ parentID: null }).select("_id");

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

  //Nếu đúng thì tạo và gửi token về client
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.status(200).json({
    success: true,
    user,
    role,
    permission,
    token,
    IdFolderRoot,
  });
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
    const users = await User.findByIdAndUpdate(filter, {
      $push: { proofStore: req.body.proofStore },
    });
    return res.send(users);
  }
  return res.status(400).json({
    success: false,
    message: "Thư mục đã được cấp quyền",
  });
};

exports.getOwnStorage = async (req, res, next) => {
  const IdFolderRoot = await Proof.findOne({ parentID: null }).select("_id");
  const checkRoleID = await User.findById(req.params.id).populate("roleID");
  if (checkRoleID.roleID.roleID === "ADMIN") {
    return res.send({ IdFolderRoot: IdFolderRoot });
  } else if (checkRoleID.roleID.roleID === "MP") {
    return res.send({ proofStore: checkRoleID.proofStore });
  }
  res.send('Nothing happens')
};
