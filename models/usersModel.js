const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

SALT_WORK_FACTOR = 10

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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'role',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  creatAt: {
    type: Date,
    default: Date.now()
  },
  proofStore: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "proof"
    }
  ]
})

//hash password
userSchema.pre('save', function(next) {

  var user = this  //this = req.body
  // only hash the password if it has been modified (or is new)
  if(!user.isModified('password')) return next()
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
      if(err) return next(err);
      //hash the password using our new salt
      bcrypt.hash(user.password, salt, (err, hash) => {
          if(err) return next(err)
          // override the cleartext password with the hashed one
          user.password = hash
          next()
      })
  })
})

//compare hashed password
userSchema.methods.comparedPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("user", userSchema);

module.exports = User