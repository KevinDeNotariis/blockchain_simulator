const sha256 = require("crypto-js/sha256");
const crypto = require("crypto");
const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

const chai = require("chai");
const Transaction = require("../../classes/Transaction");
const should = chai.should();

describe("Transaction Class", () => {
  context("A newly created Transaction", () => {
    it("Should contain a sender::string, receiver::string, amount::number, id::string, timestamp::integer", () => {
      const transaction = new Transaction("sender_addr", "receiver_addr", 10);

      transaction.should.have.property("sender");
      transaction.sender.should.be.a("string").and.eq("sender_addr");

      transaction.should.have.property("receiver");
      transaction.receiver.should.be.a("string").and.eq("receiver_addr");

      transaction.should.have.property("amount");
      transaction.amount.should.be.a("number").and.eq(10);

      transaction.should.have.property("id");
      transaction.id.should.be.a("string");

      transaction.should.have.property("timestamp");
      transaction.timestamp.should.be.a("number");
    });

    it("Should contain an hash()::string depending upon every other property", () => {
      const tx = new Transaction("sender_addr", "receiver_addr", 10);

      tx.hash.should.be.instanceOf(Function);

      const tx_2 = new Transaction("sender_addr_2", "receiver_addr", 10);
      const tx_3 = new Transaction("sender_addr", "receiver_addr_2", 10);
      const tx_4 = new Transaction("sender_addr", "receiver_addr", 22);

      tx.hash().should.not.be.eq(tx_2.hash());
      tx.hash().should.not.be.eq(tx_3.hash());
      tx.hash().should.not.be.eq(tx_4.hash());
    });

    it("Should have an id which is unique", () => {
      const tx_1 = new Transaction("sender_addr", "receiver_addr", 10);
      const tx_2 = new Transaction("sender_addr", "receiver_addr", 10);

      tx_1.id.should.not.be.eq(tx_2.id);
    });
  });

  context("The constructor", () => {
    it("May take either an object or a triple of {sender, receiver, amount}", () => {
      const data = {
        sender: "sender_addr",
        receiver: "receiver_addr",
        amount: 10,
        id: "id",
        timestamp: 1000,
      };

      const tx_1 = new Transaction(data);
      const tx_2 = new Transaction("sender_addr", "receiver_addr", 10);

      tx_1.should.have.property("sender");
      tx_1.sender.should.be
        .a("string")
        .and.eq("sender_addr")
        .and.eq(tx_2.sender);
      tx_1.should.have.property("receiver");
      tx_1.receiver.should.be
        .a("string")
        .and.eq("receiver_addr")
        .and.eq(tx_2.receiver);
      tx_1.should.have.property("amount");
      tx_1.amount.should.be.a("number").and.eq(10).and.eq(tx_2.amount);

      tx_1.should.have.property("id");
      tx_1.id.should.be.a("string").and.eq("id");
      tx_1.should.have.property("timestamp");
      tx_1.timestamp.should.be.a("number").and.eq(1000);
    });
  });

  context("The sign method", () => {
    it("Should add a signature::string in the transaction", () => {
      const key = ec.keyFromSecret("sender_private_key");
      const tx = new Transaction(key.getPublic("hex"), "receiver_addr", 10);

      tx.sign.should.be.instanceOf(Function);

      tx.sign("sender_private_key");

      tx.should.have.property("signature");
      tx.signature.should.be.a("string");
    });

    it("Should add a signature='INVALID' for an invalid pair of public and private sender keys", () => {
      const tx = new Transaction("sender_addr", "receiver_addr", 10);
      tx.sign("not the private key of sender addr");

      tx.signature.should.be.eq("INVALID");
    });

    it("Should add a signature depending on the sender_private_key passed to it", () => {
      const key_1 = ec.keyFromSecret("sender_private_key_1");
      const key_2 = ec.keyFromSecret("sender_private_key_2");

      const tx_1 = new Transaction(key_1.getPublic("hex"), "receiver_addr", 10);
      const tx_2 = new Transaction(key_2.getPublic("hex"), "receiver_addr", 10);

      tx_1.sign("sender_private_key_1");
      tx_2.sign("sender_private_key_2");

      tx_1.signature.should.not.be.eq(tx_2.signature);
    });

    it("Should add a unique signature for different transactions", () => {
      const key_1 = ec.keyFromSecret("sender_private_key_1");
      const key_2 = ec.keyFromSecret("sender_private_key_2");

      const tx_1 = new Transaction(key_1.getPublic("hex"), "receiver_addr", 10);
      const tx_2 = new Transaction(key_2.getPublic("hex"), "receiver_addr", 10);

      tx_1.sign("sender_private_key_1");
      tx_2.sign("sender_private_key_2");

      tx_1.signature.should.not.be.eq(tx_2.signature);
    });
  });

  context("The verify method", () => {
    it("Should return true if the signature is valid", () => {
      const sender_key = ec.keyFromSecret("sender_private_key");
      const sender_pub_key = sender_key.getPublic("hex");

      const tx = new Transaction(sender_pub_key, "receiver_addr", 10);
      tx.sign("sender_private_key");

      tx.verify.should.be.instanceOf(Function);
      tx.verify().should.be.eq(true);
    });

    it("Should return false for a change in signature", () => {
      const sender_key = ec.keyFromSecret("sender_private_key");
      const sender_pub_key = sender_key.getPublic("hex");

      const tx = new Transaction(sender_pub_key, "receiver_addr", 10);
      tx.sign("sender_private_key");

      tx.signature = "WRONG SIGNATURE";

      tx.verify().should.be.eq(false);
    });

    it("Should return false if the sender or receiver or amount change (while keeping the signature the same)", () => {
      const sender_key = ec.keyFromSecret("sender_private_key");
      const sender_pub_key = sender_key.getPublic("hex");

      let tx_1 = new Transaction(sender_pub_key, "receiver_addr", 10);
      tx_1.sign("sender_private_key");
      let tx_2 = new Transaction(sender_pub_key, "receiver_addr", 10);
      tx_2.sign("sender_private_key");
      let tx_3 = new Transaction(sender_pub_key, "receiver_addr", 10);
      tx_3.sign("sender_private_key");

      tx_1.sender = ec
        .keyFromSecret("wrong_sender_private_key")
        .getPublic("hex");
      tx_2.receiver = "wrong_receiver";
      tx_3.amount = "wrong_amount";

      tx_1.verify().should.be.eq(false);
      tx_2.verify().should.be.eq(false);
      tx_3.verify().should.be.eq(false);
    });
  });
});
