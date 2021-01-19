const MTree = require("../../classes/MTree");
const MTreeNode = require("../../classes/MTreeNode");

const sha256 = require("crypto-js/sha256");

const chai = require("chai");
const { expect } = require("chai");
const should = chai.should();

describe("MTree Class - Merkle Tree", () => {
  context("A new MTree", () => {
    it("Should be constructed furnishing an array of hashes", () => {
      expect(() => {
        new MTree();
      }).to.throw("MTree needs an argument in the constructor");

      expect(() => {
        new MTree("one_hash");
      }).to.throw("MTree constructor param needs to be an array");

      expect(() => {
        new MTree([1, 2]);
      }).to.throw("MTree constructor param array must be an array of strings");
    });

    it("Should contain a root node, instance of MTreeNode", () => {
      const mTree = new MTree(["hash_1", "hash_2"]);

      mTree.should.have.property("root");
      mTree.root.should.be.instanceOf(MTreeNode);
    });
  });

  context("An MTree constructed with an array of 2 strings", () => {
    const mTree = new MTree(["hash_1", "hash_2"]);
    it("Should have root node constructed as a non-leaf node", () => {
      mTree.root.is_leaf().should.be.eq(false);
    });
  });

  context(
    "The root node of an MTree constructed with an array of 2 strings",
    () => {
      const mTree = new MTree(["hash_1", "hash_2"]);

      it("Shoul have 'left' and 'right' MTreeNode which are leaves", () => {
        mTree.root.left.is_leaf().should.be.eq(true);
        mTree.root.right.is_leaf().should.be.eq(true);
      });
      it("Should have 'left' and 'right' MTreeNode with hashes equal to the hashes of the two strings", () => {
        mTree.root.left.hash
          .substring(1)
          .should.be.oneOf([
            sha256("hash_1").toString(),
            sha256("hash_2").toString(),
          ]);
        mTree.root.right.hash
          .substring(1)
          .should.be.oneOf([
            sha256("hash_1").toString(),
            sha256("hash_2").toString(),
          ]);
        mTree.root.left.hash.should.not.be.eq(mTree.root.right.hash);
      });

      it("Should have 'hash' property, correctly set as the hash of the sum of the hashes of the 'left' and 'right'", () => {
        const root_hash = sha256(
          "0" + sha256("hash_1").toString() + "0" + sha256("hash_2").toString()
        ).toString();
        mTree.root.hash.substring(1).should.be.eq(root_hash);
      });
    }
  );

  context("The method compute_layer", () => {
    context("From an input of two MTreeNode", () => {
      const node_1 = new MTreeNode("hash_1");
      const node_2 = new MTreeNode("hash_2");
      const result = MTree.compute_layer([node_1, node_2]);
      it("Should return an array with one MTreeNode", () => {
        result.should.be.a("array");
        result.length.should.be.eq(1);
        result[0].should.be.instanceOf(MTreeNode);
      });

      context("the returned MTreeNode", () => {
        it("Should NOT be a leaf", () => {
          result[0].is_leaf().should.be.eq(false);
        });

        it("Should have 'left' and 'right' pointing to the nodes in input", () => {
          result[0].left.should.be.oneOf([node_1, node_2]);
          result[0].right.should.be.oneOf([node_1, node_2]);
          result[0].left.should.not.be.eq(result[1]);
        });

        it("Should have 'hash' correctly set as the hash of the sum of hashes of the input nodes", () => {
          const ret_hash = sha256(
            result[0].left.hash + result[0].right.hash
          ).toString();
          result[0].hash.substring(1).should.be.eq(ret_hash);
        });
      });
    });

    context("From an input of three MTreeNode", () => {
      const node_1 = new MTreeNode("hash_1");
      const node_2 = new MTreeNode("hash_2");
      const node_3 = new MTreeNode("hash_3");
      const result = MTree.compute_layer([node_1, node_2, node_3]);

      it("Should return an array with two MTreeNode", () => {
        result.should.be.a("array");
        result.length.should.be.eq(2);
        result[0].should.be.instanceOf(MTreeNode);
        result[1].should.be.instanceOf(MTreeNode);
      });

      context("the returned array", () => {
        it("Should have one MTreeNode which is a leaf (in position 1) and the other which is NOT a leaf (in position 0)", () => {
          result[0].is_leaf().should.be.eq(!result[1].is_leaf());
        });

        it("Should have leaf and NON leaf nodes with hashes coming from randomly choosing the input nodes", () => {
          let is_different = false;
          for (let i = 0; i < 50; i++) {
            is_different =
              MTree.compute_layer([node_1, node_2, node_3])[0].hash ===
              result[0].hash
                ? false
                : true;
          }
          is_different.should.be.eq(true);
        });
      });

      context("the NON leaf node returned (aka the one in position 0)", () => {
        it("Should have the correct hash", () => {
          const res_hash = sha256(
            result[0].left.hash + result[0].right.hash
          ).toString();
          result[0].hash.substring(1).should.be.eq(res_hash);
        });
      });
    });

    context("From an input of 4 MTreeNode", () => {
      const node_1 = new MTreeNode("hash_1");
      const node_2 = new MTreeNode("hash_2");
      const node_3 = new MTreeNode("hash_3");
      const node_4 = new MTreeNode("hash_4");
      const result = MTree.compute_layer([node_1, node_2, node_3, node_4]);

      context("the returned array", () => {
        it("Should be of length 2", () => {
          result.should.be.a("array");
          result.length.should.be.eq(2);
        });

        it("Should have both nodes NON leaf", () => {
          result[0].is_leaf().should.be.eq(false);
          result[1].is_leaf().should.be.eq(false);
        });

        it("Should have both nodes with the correct hash", () => {
          const hash_0 = sha256(
            result[0].left.hash + result[0].right.hash
          ).toString();
          const hash_1 = sha256(
            result[1].left.hash + result[1].right.hash
          ).toString();

          result[0].hash.substring(1).should.be.eq(hash_0);
          result[1].hash.substring(1).should.be.eq(hash_1);
        });
      });
    });
  });
  /*
  context("For a MTree constructed from an array of 3 strings", () => {
    const mTree = new MTree(["hash_1", "hash_2", "hash_3"]);
    it("The left node should not be a leaf", () => {
      mTree.root.left.is_leaf().should.be.eq(false);
    });
  });*/
});
