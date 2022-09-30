const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const proofFolderSchema = new Schema({
  title: String,
  user_access: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  proofFiles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "proof_file",
    },
  ],
  parentID: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "proof_folder",
  },

});

const proofFileSchema = new Schema({
  name: String,
  data: {
    type: Buffer,
    required: false,
  },
  mimeType: {
    type: String,
    required: false,
  },
  size: {
    type: Number,
    required: false,
  },
  proofFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'proof_folder'
  },
  enactNum: String,
  enactAddress: String,
  releaseDate: Date,
  description: String,

});

const proofFolder = mongoose.model("proof_folder", proofFolderSchema);

const proofFile = mongoose.model("proof_file", proofFileSchema);

module.exports = {
  proofFolder,
  proofFile
}
