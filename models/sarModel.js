const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sarFilesSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        default: 'vi'
    },
    structure: String,
    category: String,
    status: Number,
    root: String,
    license: String,
    curriculum: String,
    desc: String,
    proofStore: {
        type: mongoose.Schema.ObjectId,
        ref: 'proof_folder'
    },
    indexID: {
        type: mongoose.Schema.ObjectId,
        ref: 'table_of_content',
        default: null
    },
    user_access: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        }
    ],
    creatAt: {
        type: Date,
        default: Date.now()
    },
    updateAt: {
        type: Date,
        default: Date.now()
    },
    user_manage: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        default: null
    }
});


const SarFile = mongoose.model("sar_file", sarFilesSchema);

module.exports = {SarFile}


