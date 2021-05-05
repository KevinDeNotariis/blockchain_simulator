const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HashSchema = new Schema({
  block_hash: {
    type: String,
    required: true,
  },
  block_id: {
    type: Number,
    required: true,
  },
});

module.exports = new mongoose.model("Hash", HashSchema);
