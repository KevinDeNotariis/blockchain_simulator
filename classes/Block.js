const sha256 = require("crypto-js/sha256");
const MTree = require("./MTree");

class Block {
  constructor() {
    this.header = {
      id: 0,
      previous_hash: "",
      txs_root: "",
      nonce: 0,
      difficulty: 0,
      timestamp: 0,
    };
    this.transactions = [];
  }

  init(id, previous_hash, difficulty, transactions) {
    if (typeof id !== "object") {
      this.header.id = id;
      this.header.previous_hash = previous_hash;
      this.header.difficulty = difficulty;
      this.transactions = transactions;

      const mTree = new MTree(transactions);
      mTree.fill_matrix();
      this.header.txs_root = mTree.root.hash;
    } else {
      const {
        _id,
        _previous_hash,
        _tsx_root,
        _nonce,
        _difficulty,
        _timestamp,
        _transactions,
      } = { ...id };
      this.header.id = _id;
      this.header.previous_hash = _previous_hash;
      this.header.txs_root = _tsx_root;
      this.header.nonce = _nonce;
      this.header.difficulty = _difficulty;
      this.header.timestamp = _timestamp;
      this.transactions = _transactions;
    }
  }

  mine() {
    let time_start = Date.now();
    while (parseInt(this.hash(), 16) > this.header.difficulty) {
      this.header.nonce++;
    }
    this.header.timestamp = Date.now();

    return {
      nonce: this.header.nonce,
      hash: this.hash(),
      duration: this.header.timestamp - time_start,
    };
  }

  hash() {
    return sha256(
      String(this.header.id) +
        this.header.previous_hash +
        this.header.txs_root +
        String(this.header.nonce) +
        String(this.header.difficulty)
    ).toString();
  }
}

/*
const block = new Block();

block.init(0, "previous_hash", Math.pow(2, 256 - 20), [
  "hash_1",
  "hash_2",
  "hash_3",
]);

console.log(block);

console.log(block.mine());

console.log(block);
*/

module.exports = Block;
