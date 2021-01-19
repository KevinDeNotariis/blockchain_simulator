const chai = require("chai");
const should = chai.should();

const sha256 = require("crypto-js/sha256");

const Block = require("../../classes/Block");
const Transaction = require("../../classes/Transaction");

describe("Block Class", () => {
  context("The constructor", () => {
    it("Should require an id, previous_hash, transactions", () => {});
  });
  context("A newly created Block", () => {
    it("Should have: id::Number, previous_hash::String, transactions::Array_of_transactions", () => {
      const block = new Block(1, "123", []);

      block.should.have.property("id");
      block.id.should.be.a("number").and.eq(1);
      block.should.have.property("previous_hash");
      block.previous_hash.should.be.a("string").eq("123");
      block.should.have.property("transactions");
      block.transactions.should.be.a("array");
      block.transactions.length.should.be.eq(0);
    });

    it("Should have a nonce property initialized at 0", () => {
      const block = new Block(1, "123", []);
      block.should.have.property("nonce");
      block.nonce.should.be.a("number").eq(0);
    });
  });

  context("The method hash", () => {
    it("Should return an hash depending on the id of the block", () => {
      const block = new Block(1, "123", []);

      block.hash.should.be.instanceOf(Function);
      block.hash().should.be.a("string");
      const hash_1 = block.hash();

      block.id = 2;
      block.hash().should.be.not.eq(hash_1);
    });

    it("Should return an hash depending on the previous_hash of the block", () => {
      const block = new Block(1, "123", []);

      const hash_1 = block.hash();

      block.previous_hash = "456";

      block.hash().should.be.not.eq(hash_1);
    });

    it("Should return an hash depending on the nonce", () => {
      const block = new Block(1, "123", []);

      const hash_1 = block.hash();

      block.nonce = 12;

      block.hash().should.be.not.eq(hash_1);
    });

    it("Should return an hash depending on the transactions", () => {
      const tx_1 = new Transaction(
        "sender_address_1",
        "receiver_address_1",
        100
      );
      const tx_2 = new Transaction(
        "sender_address_2",
        "receiver_address_2",
        120
      );

      const block_1 = new Block(1, "123", [tx_1]);
      const block_2 = new Block(1, "123", [tx_2]);

      block_1.hash().should.not.be.eq(block_2.hash());
    });
  });
});
