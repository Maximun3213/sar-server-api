const mongoose = require("mongoose")

const Schema = mongoose.Schema

const ImageSchema = new Schema({
    name: String,
    file: {
        data: Buffer,
        mimeType: String,
        size: Number,
    }
})
const Image = mongoose.model("image", ImageSchema)

module.exports = Image
