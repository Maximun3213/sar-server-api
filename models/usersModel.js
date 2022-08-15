const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  cbID: {
    type: String,
    unique: true,
    required: [true, "Mã CB không được trống"],
    max: [6, "MaCB tối đa 6 ký tự"]
  },
  fullName: {
    type: String,
    required: [true, "Tên cán bộ không được trống"],
    max: [30, "Tên tối đa 30 ký tự"]
  },
  roleID: {
    type: String,
    required: [true, "Quyền không được trống"],
    default: 'USER',
    ref: 'Role',
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  creatAt: {
    type: Date,
    default: Date.now()
  }
})

const User = mongoose.model("user", userSchema);

module.exports = User