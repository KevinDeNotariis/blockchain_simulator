/*
const sha256 = require("crypto-js/sha256");
const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

class Transaction {
  constructor(id, sender, receiver, amount) {
    this.id = id;
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;

    this.set_hash();
  }

  sign(sender_private_key) {
    this.signature = ec
      .keyFromSecret(sender_private_key)
      .sign(this.hash)
      .toHex();
  }

  verify() {
    return ec
      .keyFromPublic(this.sender, "hex")
      .verify(this.hash, this.signature);
  }

  set_hash() {
    this.hash = sha256(this.serialize()).toString();
  }

  serialize() {
    return this.id + this.sender + this.receiver + String(this.amount);
  }
}

module.exports = { Transaction };*/
