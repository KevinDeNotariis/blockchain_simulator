const sha256 = require("crypto-js/sha256");

class Block {
  constructor(id, previous_hash, transactions) {
    this.id = id;
    this.previous_hash = previous_hash;
    this.transactions = transactions;

    this.nonce = 0;
  }

  serialize_transactions() {
    let ret = "";
    this.transactions.map((tx) => {
      ret += tx.sender + tx.receiver + String(tx.amount) + tx.id;
    });
    return ret;
  }

  hash() {
    return sha256(
      String(this.id) +
        this.previous_hash +
        String(this.nonce) +
        this.serialize_transactions()
    ).toString();
  }
}

module.exports = Block;
