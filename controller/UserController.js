const User = require("../models/usersModel");
const Role = require("../models/rolesModel");
const Image = require("../models/imageModel");

const jwt = require("jsonwebtoken");
const json = require("body-parser");
const fs = require("fs");
const multer = require("multer");

const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
}).single("testImage");


exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if(err){
      console.log(err)
    }
    const newImage = new Image({
      name: req.body.name,
      image: {
        data: req.file.filename,
        contentType: "image/png",
      },
    });
    newImage
      .save()
      .then(() => res.send(req.file))
      .catch((err) => console.log(err));
  })
  
};


exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  //Kiểm tra email có tồn tại hay chưa
  const user = await User.findOne({ email });

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Email không tồn tại" });

  //KIểm tra password có đúng hay không bằng cách hash password
  const isPasswordMatched = await user.comparedPassword(password);

  if (!isPasswordMatched)
    return res.status(400).json({
      success: false,
      message: "Mật khẩu không đúng",
    });

  //Nếu đúng thì lấy role, permission, token và gửi về client
  const role = await Role.findById(user.roleID);
  const permission = await Role.findById(role._id)
    .populate("permissionID")
    .exec();


  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.status(200).json({
    success: true,
    user,
    role,
    permission,
    token,
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
