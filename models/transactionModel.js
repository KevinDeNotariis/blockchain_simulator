const sha256 = require("crypto-js/sha256");
const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  signature: {
    type: String,
    require: true,
  },
});

TransactionSchema.methods.sign = function (sender_private_key) {
  this.set_hash();
  this.signature = ec.keyFromSecret(sender_private_key).sign(this.hash).toHex();
};

TransactionSchema.methods.hash = function () {
  return sha256(
    this.sender +
      this.receiver +
      String(this.amount) +
      this.id +
      String(this.timestamp)
  ).toString();
};

TransactionSchema.methods.verify = function () {
  return ec
    .keyFromPublic(this.sender, "hex")
    .verify(this.hash(), this.signature);
};

TransactionSchema.methods.set_hash = function () {
  this.hash = sha256(this.serialize()).toString();
};

TransactionSchema.methods.serialize = function () {
  return this.id + this.sender + this.receiver + String(this.amount);
};

module.exports = new mongoose.model("Transaction", TransactionSchema);
exports.schema = TransactionSchema;
