const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    permissionID: {
        type: String,
        required: true
    },
    permissionName: {
        type: String,
        require: true
    }
    
})

const Permission = mongoose.model("permission", permissionSchema);

module.exports = Permission