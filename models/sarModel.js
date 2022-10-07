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
        ref: 'sar_proof_folder'
    },
    indexID: {
        type: mongoose.Schema.ObjectId,
        ref: 'table_of_content'
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
    updateAt: Date,
    
});

const sarFoldersSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    parentID: {
        type: mongoose.Schema.ObjectId,
        ref: 'sar_proof_folder',
        default: null
    },
    docs: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'proof_file',
        }
    ]
})



const SarProofFolder = mongoose.model("sar_proof_folder", sarFoldersSchema);
const SarFile = mongoose.model("sar_file", sarFilesSchema);

module.exports = {
    SarFile,
    SarProofFolder,

};
