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
    // type: mongoose.Schema.Types.ObjectId,
    type: mongoose.Schema.Types.ObjectId,
    default: "",
    ref: 'proof'
  }


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
