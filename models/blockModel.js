const mongoose = require("mongoose");
const sha256 = require("crypto-js/sha256");

const Schema = mongoose.Schema;

const TransactionSchema = require("./transactionModel");

const BlockHeaderSchema = new Schema({
  _id: false,
  id: {
    type: Number,
    required: true,
  },
  previous_hash: {
    type: String,
    required: true,
  },
  txs_root: {
    type: String,
    required: true,
  },
  nonce: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
  },
});

const BlockSchema = new Schema({
  header: {
    type: BlockHeaderSchema,
    required: true,
  },
  transactions: {
    type: [TransactionSchema],
    required: true,
  },
});

BlockSchema.methods.hash = function () {
  return sha256(
    String(this.header.id) +
      this.header.previous_hash +
      this.header.txs_root +
      String(this.header.nonce) +
      String(this.header.difficulty)
  ).toString();
};
/*
BlockSchema.methods.hash_from_tr = function (transactions) {
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
    hash = this.hash_from_tr(transactions);
    if (parseInt(hash, 16) < target) {
      break;
    }
  }
  console.log(" - Hash found: " + this.hash());
  console.log(" - With nonce: " + this.nonce);
  return this;
};*/

module.exports = BlockSchema;
