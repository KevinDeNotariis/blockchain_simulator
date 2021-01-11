const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserModel = new Schema({
  public_key: {
    type: String,
    required: true,
  },
  private_key: {
    type: String,
    required: true,
  },
});

module.exports = UserModel;
