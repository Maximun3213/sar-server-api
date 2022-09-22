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
      ref: "proofFile",
    },
  ],
  children: [
    // {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "proofFolder",
    // },
  ],
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
  
});

// const Proof = mongoose.model("proof", ProofSchema);

const proofFolder = mongoose.model("proof_folder", proofFolderSchema);

const proofFile = mongoose.model("proof_file", proofFileSchema);

module.exports = {
  proofFolder,
  proofFile
}
