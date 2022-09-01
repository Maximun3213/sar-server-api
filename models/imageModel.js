const mongoose = require("mongoose")

const Schema = mongoose.Schema

const ImageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    file: {
        data: {
            "fieldname": String,
            "originalname": String,
            "encoding": String,
            "mimetype": String,
            "destination": String,
            "filename": String,
            "path": String,
            "size": Number
        },
        contentType: String
    }
})
const Image = mongoose.model("image", ImageSchema)

module.exports = Image
