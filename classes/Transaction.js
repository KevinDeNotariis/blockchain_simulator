const crypto = require("crypto");
const sha256 = require("crypto-js/sha256");
const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

class Transaction {
  constructor(sender, receiver, amount) {
    if (typeof sender === "object") {
      this.sender = sender.sender;
      this.receiver = sender.receiver;
      this.amount = Number(sender.amount);
      this.id = sender.id;
      this.timestamp = Number(sender.timestamp);
      this.signature = sender.signature;
    } else {
      this.sender = sender;
      this.receiver = receiver;
      this.amount = amount;

      this.id = crypto.randomBytes(32).toString("hex");
      this.timestamp = Date.now();
    }
  }

  hash() {
    return sha256(
      this.sender +
        this.receiver +
        String(this.amount) +
        this.id +
        String(this.timestamp)
    ).toString();
  }

  sign(sender_private_key) {
    if (ec.keyFromSecret(sender_private_key).getPublic("hex") !== this.sender) {
      this.signature = "INVALID";
      return false;
    }
    this.signature = ec
      .keyFromSecret(sender_private_key)
      .sign(this.hash())
      .toHex();
    return true;
  }

  verify() {
    return ec
      .keyFromPublic(this.sender, "hex")
      .verify(this.hash(), this.signature);
  }
}

module.exports = Transaction;
