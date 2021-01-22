const MTreeNode = require("../../classes/MTreeNode");
const chai = require("chai");
const sha256 = require("crypto-js/sha256");
const { expect } = require("chai");
const MTree = require("../../classes/MTree");
const should = chai.should();

describe("MtreeNode Class", () => {
  context("A default constructed Node without providing children", () => {
    it("Should contain a 'left' and 'right' property of type 'undefined'", () => {
      const mTreeNode = new MTreeNode("hash");

      mTreeNode.should.have.property("left");
      (typeof mTreeNode.left).should.be.eq("undefined");

      mTreeNode.should.have.property("right");
      (typeof mTreeNode.right).should.be.eq("undefined");
    });
    it("Should have the property hash::string set to value used in constructor", () => {
      const mTreeNode = new MTreeNode("hash");

      mTreeNode.should.have.property("hash");
      mTreeNode.hash.should.be.a("string");
    });

    it("Should contain a leading 0x00 before the actual hash in the hash property", () => {
      for (let i = 0; i < 50; i++) {
        const mTreeNode = new MTreeNode("hash" + i);
        mTreeNode.hash.substring(0, 1).should.be.eq((0x00).toString());
      }
    });

    it("Should be set to the sha256 of the value passed to the constructor (exluding leading byte)", () => {
      const mTreeNode = new MTreeNode("hash");

      mTreeNode.hash.substring(1).should.be.eq(sha256("hash").toString());
    });
  });
  context("A Node constructed providing only a left children", () => {
    it("Should throw an error", () => {
      expect(() => {
        new MTreeNode("hash", new MTreeNode("hash_left"));
      }).to.throw("A Node can be constructed with 0 or 2 children, not 1");
    });
  });

  context("A Node constructed providing both children", () => {
    const mTreeNode = new MTreeNode(
      "hash",
      new MTreeNode("hash_left"),
      new MTreeNode("hash_right")
    );
    it("Should have properties 'left' and 'right' as instances of MTreeNode", () => {
      mTreeNode.should.have.property("left");
      mTreeNode.left.should.be.instanceOf(MTreeNode);

      mTreeNode.should.have.property("right");
      mTreeNode.right.should.be.instanceOf(MTreeNode);
    });

    it("Should have 'hash' value as the hash of the sum of the left and right hashes (excluding leading byte", () => {
      mTreeNode.should.have.property("hash");
      mTreeNode.hash
        .substring(1)
        .should.be.a("string")
        .and.eq(sha256(mTreeNode.left.hash + mTreeNode.right.hash).toString());
    });

    it("Should have a 'hash' value with a leading 0x01 since it is not a leaf", () => {
      for (let i = 0; i < 50; i++) {
        const mTreeNode = new MTreeNode(
          "hash" + i,
          new MTreeNode("hash_left" + i),
          new MTreeNode("hash_right" + i)
        );

        mTreeNode.hash.substring(0, 1).should.be.eq("1");
      }
    });
  });

  context("The method is_leaf", () => {
    it("Should return true for a leaf node", () => {
      const mTreeNode = new MTreeNode("hash");

      mTreeNode.is_leaf.should.be.instanceOf(Function);
      mTreeNode.is_leaf().should.be.a("boolean").and.eq(true);
    });

    it("Should return false for a NON leaf node", () => {
      const mTreeNode = new MTreeNode(
        "hash",
        new MTreeNode("hash_left"),
        new MTreeNode("hash_right")
      );

      mTreeNode.is_leaf().should.be.eq(false);
    });
  });

  context("The clone method", () => {
    it("Should return an instance of MTreeNode", () => {
      const mTreeNode = new MTreeNode("hash");
      mTreeNode.clone().should.be.instanceOf(MTreeNode);

      const mTreeNode_2 = new MTreeNode(
        "hash",
        new MTreeNode("hash_left"),
        new MTreeNode("hash_right")
      );
      mTreeNode_2.clone().should.be.instanceOf(MTreeNode);
    });
    context("Should return a copy of the object, namely it", () => {
      const mTreeNode = new MTreeNode("hash");
      const mTreeNode_clone = mTreeNode.clone();

      const mTreeNode_2 = new MTreeNode(
        "hash",
        new MTreeNode("hash_left"),
        new MTreeNode("hash_right")
      );
      const mTreeNode_2_clone = mTreeNode_2.clone();
      it("Should have the same hash", () => {
        mTreeNode_clone.hash.should.be.eq(mTreeNode.hash);
        mTreeNode_2_clone.hash.should.be.eq(mTreeNode_2.hash);
      });

      it("Should have the same 'left' and 'right' nodes", () => {
        (typeof mTreeNode_clone.left).should.be.eq("undefined");
        (typeof mTreeNode_clone.right).should.be.eq("undefined");

        mTreeNode_2_clone.left.should.be.instanceOf(MTreeNode);
        mTreeNode_2_clone.left.hash.should.be.eq(mTreeNode_2.left.hash);
        mTreeNode_2_clone.right.should.be.instanceOf(MTreeNode);
        mTreeNode_2_clone.right.hash.should.be.eq(mTreeNode_2.right.hash);
      });
    });
  });
});
