const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const crudSchema = new Schema({
    crudID: {
        type: String,
        required: true
    },
    crudName: {
        type: String,
        require: true
    }
    
})

const Crud = mongoose.model("Crud", crudSchema);

module.exports = Crud