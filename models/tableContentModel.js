const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tableContentSchema = new Schema({
    sarID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sar_file'
    },
    partID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'part'
        }
    ]
});

const partSchema = new Schema({
    title: String,
    chapterID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chapter',
        }
    ],
    order: Number,
})

const chapterSchema = new Schema({
    title: String,
    content: String,
    partID: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'part',
            default: null
        },
    criteriaID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'criteria',
        }
    ],
    order: Number,

})

const criteriaSchema = new Schema({
    title: String,
    content: String,
    parentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'criteria',
        default: null,
    },
    childrenID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'criteria',
        }
    ],
    user_access: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    proof_FolderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sar_proof_folder',
        default: null
    },
    order: Number,

})

const TableOfContent = mongoose.model("table_of_content", tableContentSchema);
const Part = mongoose.model("part", partSchema);
const Chapter = mongoose.model("chapter", chapterSchema);
const Criteria = mongoose.model("criteria", criteriaSchema);

module.exports = {
    TableOfContent,
    Part,
    Chapter,
    Criteria
};
