const User = require("../models/usersModel");
const jwt = require("jsonwebtoken");
const json = require("body-parser")

exports.userLogin = async (req, res) => {
  
  const { email, password } = req.body;
  //Kiểm tra email có tồn tại hay chưa
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({
    success: false,
    message: "Invalid password"
  });

  //KIểm tra password có đúng hay không bằng cách hash password
  const isPasswordMatched = await user.comparedPassword(password);

  if (!isPasswordMatched)
    return res.status(400).json({
      success: false,
      message: "Invalid password"
    });

  //Nếu đúng thì tạo và gửi token về client
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.status(200).json({
    success: true,
    user,
    token
  });
};

exports.userList = (req, res) => {
    User.find({}, (err, result) => {
      res.send(result);
    });
  };

//test đăng ký user
exports.userRegister = async (req, res) => {
  const { cbID, fullName, roleID, email, password } = req.body

  const user = await User.create({
    cbID,
    fullName,
    roleID,
    email,
    password
  })
  res.status(200).json({
    success: true,
    message: "Create user successfully"
  })
}