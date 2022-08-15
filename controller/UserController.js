const User = require("../models/usersModel");
const jwt = require("jsonwebtoken");
const json = require("body-parser")

exports.userLogin = async (req, res) => {
  
  //Kiểm tra email có tồn tại hay chưa
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email is not found");

  //KIểm tra password có đúng hay không bằng cách hash password
  const isPasswordMatched = await.comparedPassword(req.body.password);

  //KIểm tra password có đúng hay không theo chuỗi thông thường
  if (req.body.password != user.password)
    return res.status(400).send("Invalid password");

  //Nếu đúng thì tạo và gửi token về client
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);
  // res.send('success')
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