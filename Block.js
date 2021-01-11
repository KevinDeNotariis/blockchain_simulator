const sha256 = require("crypto-js/sha256");

class Block {
  constructor(id, previous_hash, transactions) {
    this.id = id;
    this.previous_hash = previous_hash;
    this.transactions = transactions;

    this.nonce = -1;
    this.hash = 0;
    this.target = Math.pow(2, 256 - 16);
  }

  hash_block() {
    let transactions = "";
    this.transactions.map((elem) => {
      transactions += elem.serialize();
    });
    this.hash = sha256(
      this.nonce + transactions + this.previous_hash + this.id
    ).toString();
  }

  mine_block(target) {
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
    console.log(
      " - Computing the hash in order to reach the target: " + target
    );
    while (true) {
      this.nonce++;
      this.hash = sha256(
        this.nonce + transactions + this.previous_hash + this.id
      ).toString();
      if (parseInt(this.hash, 16) < target) {
        break;
      }
    }
    console.log(" - Hash found: " + this.hash);
    console.log(" - With nonce: " + this.nonce);
  }
}

module.exports = { Block };
