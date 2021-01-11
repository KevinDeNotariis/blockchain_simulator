const mongoose = require("mongoose");
const sha256 = require("crypto-js/sha256");

const TransactionSchema = require("./transactionModel");

const Schema = mongoose.Schema;

const BlockSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  previous_hash: {
    type: String,
    required: true,
  },
  nonce: {
    type: Number,
    default: 0,
  },
  transactions: {
    type: [TransactionSchema],
    required: true,
  },
  target: {
    type: Number,
    default: Math.pow(2, 256 - 16),
  },
});

BlockSchema.methods.hash = function () {
  let transactions = "";
  this.transactions.map((elem) => {
    transactions += elem.serialize();
  });
  return sha256(
    this.nonce + transactions + this.previous_hash + this.id
  ).toString();
};

BlockSchema.methods.hash = function (transactions) {
  return sha256(
    this.nonce + transactions + this.previous_hash + this.id
  ).toString();
};

BlockSchema.methods.mine_block = function (target = this.target) {
  console.log("INSIDE THE mine_block METHOD OF BLOCK CLASS");
  console.log("  Minining the following block: ");
  console.log("  id: " + this.id);
  console.log("  previous_hash: " + this.previous_hash);
  console.log("  transactions: ");
  let transactions = "";
  this.transactions.map((elem) => {
    transactions += elem.serialize();
    console.log("                " + elem.id);
  });
  console.log(" - Computing the hash in order to reach the target: " + target);
  let hash;
  while (true) {
    this.nonce++;
    hash = this.hash(transactions);
    if (parseInt(hash, 16) < target) {
      break;
    }
  }
  console.log(" - Hash found: " + this.hash());
  console.log(" - With nonce: " + this.nonce);
  return this;
};

module.exports = BlockSchema;
