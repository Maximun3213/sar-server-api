const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roleSchema = new Schema({
    roleID: {
        type: String,
        required: true,
        unique: true
    },
    roleName: {
        type: String,
        require: true,
    },
    permissionID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission',
            require: true   
        }
    ]
    
})

const Role = mongoose.model("role", roleSchema);

module.exports = Role