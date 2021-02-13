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
    type: [{ type: TransactionSchema, _id: false }],
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

module.exports = BlockSchema;
