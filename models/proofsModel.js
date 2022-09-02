const mongoose = require("mongoose")

const Schema = mongoose.Schema

const ImageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    file: {
        data: Buffer,
        contentType: String
    }
})
const Image = mongoose.model("image", ImageSchema)

module.exports = Image
