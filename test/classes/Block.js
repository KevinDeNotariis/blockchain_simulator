const chai = require("chai");
const should = chai.should();

const sha256 = require("crypto-js/sha256");

const Block = require("../../classes/Block");
const Transaction = require("../../classes/Transaction");

describe("Block Class", () => {
  context("A Block", () => {
    const block = new Block();
    it("Should have an 'header' property", () => {
      block.should.have.property("header");
    });
    it("Should have an 'transactions' property", () => {
      block.should.have.property("transactions");
    });
  });
  context("The header of a block", () => {
    const block = new Block();
    it("Should contain the following properties: id, previous_hash, txs_root, nonce, difficulty, timestamp", () => {
      block.header.should.have.property("id");
      block.header.should.have.property("previous_hash");
      block.header.should.have.property("txs_root");
      block.header.should.have.property("nonce");
      block.header.should.have.property("difficulty");
      block.header.should.have.property("timestamp");
    });
  });
  context("In the header of a block", () => {
    const block = new Block();
    it("The id should be a number", () => {
      block.header.id.should.be.a("number");
    });
    it("The previous_hash should be a string", () => {
      block.header.previous_hash.should.be.a("string");
    });
    it("The txs_root should be a string", () => {
      block.header.txs_root.should.be.a("string");
    });
    it("The nonce should be a number", () => {
      block.header.nonce.should.be.a("number");
    });
    it("The difficulty should be a number", () => {
      block.header.difficulty.should.be.a("number");
    });
    it("The timestamp should be a number", () => {
      block.header.timestamp.should.be.a("number");
    });
  });

  context("The transactions of a block", () => {
    const block = new Block();
    it("Should be an array of strings (hashes)", () => {
      block.transactions.should.be.a("array");
    });
  });
});
