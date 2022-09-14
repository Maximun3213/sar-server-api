const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProofSchema = new Schema({
  name: String,
  data: {
    type: Buffer,
    required: false
  },
  mimeType: {
    type: String,
    required: false
  },
  size: {
    type: Number,
    required: false
  },
  parentID: {
    type: String,
    required: false
  }
});
const Proof = mongoose.model("proof", ProofSchema);

module.exports = Proof;
