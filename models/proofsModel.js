const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProofSchema = new Schema({
  name: String,
  data: Buffer,
  mimeType: String,
  size: Number,

  // name: String,
  // size: {
  //   require: false,
  //   type: Number
  // },
  // type: {
  //   type: String,
  //   default: 'folder'
  // }
  // children: [{}]
});
const Proof = mongoose.model("proof", ProofSchema);

module.exports = Proof;
