const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HashSchema = new Schema({
  block_hash: {
    type: String,
    required: true,
  },
  block_id: {
    type: String,
    required: true,
  },
});

module.exports = HashSchema;
