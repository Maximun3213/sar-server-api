const Notification = require("../models/notificationModel");

exports.setNotification = (idSender, userID, createAt, content) => {
    const notification = new Notification({
        sender: idSender,
        receiver: userID,
        createAt: createAt,
        content: content,
    });
    notification.save();
}