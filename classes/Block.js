const sha256 = require("crypto-js/sha256");
const MTree = require("./MTree");
const Transaction = require("./Transaction");

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

      let txs_hashes = [];
      for (let i in transactions) {
        txs_hashes.push(transactions[i].hash());
      }

      const mTree = new MTree(txs_hashes);
      mTree.fill_matrix();
      this.header.txs_root = mTree.root.hash;
    } else {
      this.header = id.header;
      this.transactions = id.transactions;
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

  mined() {
    return parseInt(this.hash(), 16) <= this.header.difficulty;
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
