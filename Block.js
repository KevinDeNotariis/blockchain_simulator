const sha256 = require("crypto-js/sha256");
const crypto = require("crypto");

class Transaction {
  constructor(sender, receiver, amount) {
    this.id = crypto.randomBytes(32).toString("hex");
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
  }
  serialize() {
    return String(this.id) + this.sender + this.receiver + String(this.amount);
  }
}

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
/*
let transaction = new Transaction("Kev", "Gio", 30);
let transaction2 = new Transaction("Kev", "Teo", 50);

let block = new Block(1, sha256("Hello world").toString(), [
  transaction,
  transaction2,
]);

block.mine_block(block.target);

console.log(block.hash);
console.log(block.nonce);*/

module.exports = { Block, Transaction };
