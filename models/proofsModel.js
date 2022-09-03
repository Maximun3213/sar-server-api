const mongoose = require("mongoose")

const Schema = mongoose.Schema

const ImageSchema = new Schema({
    // name: {
    //     type: String,
    // },
    file: {
        data: Buffer,
        fileName: String,
        mimeType: String,
        size: Number,
    }
})
const Image = mongoose.model("image", ImageSchema)

module.exports = Image
