const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  content: String,
  is_read: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;
