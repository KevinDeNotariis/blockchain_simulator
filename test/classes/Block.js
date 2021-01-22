const chai = require("chai");
const should = chai.should();

const sha256 = require("crypto-js/sha256");

const Block = require("../../classes/Block");
const Transaction = require("../../classes/Transaction");

describe("Block Class", () => {
  context("A Block", () => {
    it("Should have an 'header' property", () => {
      const block = new Block();
      block.should.have.property("header");
    });
    it("Should have an 'body' property", () => {
      const block = new Block();
      block.should.have.property("body");
    });
  });
  context("The header of a block", () => {
    it("Should contain the following properties: id, previous_hash, txs_root, nonce", () => {
      const block = new Block();
      block.header.should.have.property("id");
      block.header.should.have.property("previous_hash");
      block.header.should.have.property("txs_root");
      block.header.should.have.property("nonce");
    });
  });
});
