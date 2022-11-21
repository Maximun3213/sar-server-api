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
    type: {
        type: String,
        default: 'part'
    }
})

const chapterSchema = new Schema({
    title: String,
    content: String,
    criteriaID: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'criteria',
        }
    ],
    order: Number,
    type: {
        type: String,
        default: 'chapter'
    },
    user_access: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    proof_docs: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'proof_file',
        }
    ]
})

const criteriaSchema = new Schema({
    title: String,
    content: String,
    user_access: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    order: Number,
    type: {
        type: String,
        default: 'criteria'
    },
    proof_docs: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'proof_file',
        }
    ]
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
