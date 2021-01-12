const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PeerSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
  },
  type: {
    type: String,
    required: true,
  },
});

module.exports = PeerSchema;
