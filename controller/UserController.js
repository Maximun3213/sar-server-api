const User = require("../models/usersModel");
const jwt = require("jsonwebtoken");

exports.userLogin = async (req, res) => {
  // console.log("req.body: ", req.body);

  // const newUser = new User({
  //   email: req.body.email,
  //   password: req.body.password
  // })

  // await User.create(newUser);
  // res.send("User added")

  //Kiểm tra email có tồn tại hay chưa
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email is not found");

  //KIểm tra password có đúng hay không bằng cách hash password
  // const validPass = await bcrypt.compare(req.body.password, user.password);
  // console.log(validPass)
  // if(!validPass) return res.status(400).send('Invalid password');

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
