const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roleSchema = new Schema({
    roleID: {
        type: String,
        required: true,
    },
    roleName: {
        type: String,
        require: true,
    }
    crudID: {
        type: String,
        ref: 'Crud',
        require: true
    }
    
})

const Role = mongoose.model("Role", roleSchema);

module.exports = Role