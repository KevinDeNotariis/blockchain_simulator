const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NodeSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("Node", NodeSchema);
