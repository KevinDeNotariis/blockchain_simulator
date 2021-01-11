const mongoose = require("mongoose");
const NodeSchema = require("./nodeModel");

const Schema = mongoose.Schema;

const BlockchainSchema = new Schema({
  _id: false,
  max_id: {
    type: Number,
  },
  nodes: {
    type: [NodeSchema],
  },
});

module.exports = BlockchainSchema;
