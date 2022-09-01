const User = require("../models/usersModel");
const Role = require("../models/rolesModel");
const Image = require("../models/imageModel");

const jwt = require("jsonwebtoken");
const json = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + file.originalname.match(/\..*$/)[0]
    );
  },
});

const upload = multer({
  storage: Storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype == "image/png" ||
  //     file.mimetype == "image/jpg" ||
  //     file.mimetype == "image/jpge"
  //   ) {
  //     cb(null, false);
  //     const err = new Error("Only .doc, .pdf, .xls file format allowed");
  //     err.name = "ExtensionError";
  //     return cb(err);
  //   } else {
  //     cb(null, true);
  //   }
  // },
}).array("uploadedFiles");

// var getFileFromStore = function(uri, filename, callback){
//   request.head(uri, function(err, res, body){
//     console.log('content-type:', res.headers['content-type']);
//     console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//   });
// };

// download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
//   console.log('done');
// });

exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.send(err)
    }
    const fileList = req.files;
    fileList.map((file, index) => {
      const newImage = new Image({
        name: req.body.name,
        file: {
          data: file,
          contentType: "multipart/form-data",
        },
      });
      newImage
        .save()
        .then(() => console.log(`1 file uploaded`))
        .catch((err) => console.log(err));
    });
    res.status(200).json({
      success: true,
      message: "Upload file successfully",
      fileList,
    });
  });
};

//In danh sách file
exports.getFileList = (req, res) => {
  Image.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.send(items);
    }
  });
};

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

  //Nếu đúng thì tạo và gửi token về client
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
