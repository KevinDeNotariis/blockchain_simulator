const sha256 = require("crypto-js/sha256");

class Block {
  constructor() {
    this.header = {
      id: "",
      previous_hash: "",
      txs_root: "",
      nonce: 0,
    };
    this.body = {};
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
