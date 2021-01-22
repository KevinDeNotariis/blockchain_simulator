const MTree = require("../../classes/MTree");
const MTreeNode = require("../../classes/MTreeNode");
const MTreeProof = require("../../classes/MTreeProof");

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
        it("Should have two non-leaf nodes", () => {
          result[0].is_leaf().should.be.eq(false);
          result[1].is_leaf().should.be.eq(false);
        });
      });

      context("the returned node in position 0", () => {
        it("Should have 'left' and 'right' hashes equals to the first and second elements in the array", () => {
          result[0].left.hash.should.be.eq(node_1.hash);
          result[0].right.hash.should.be.eq(node_2.hash);
        });
      });

      context("the returned node in position 1", () => {
        it("Should have 'left' and 'right' hashes equals", () => {
          result[1].left.hash.should.be.eq(result[1].right.hash);
        });

        it("Should have 'left' and 'right' hashes equals to the element in position 2 in the array", () => {
          result[1].left.hash.should.be.eq(node_3.hash);
          result[1].right.hash.should.be.eq(node_3.hash);
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

        context("Should have both nodes with the correct hash, namely", () => {
          context("The node in position 0", () => {
            it("Should have 'left' and 'right' nodes equals to the nodes in position 0 and 1 in the input array", () => {
              result[0].left.should.be.eq(node_1);
              result[0].right.should.be.eq(node_2);
            });
            it("Should have 'hash' given by the combination of the hashes of the nodes in position 0 and 1 of the input array", () => {
              const hash = sha256(node_1.hash + node_2.hash).toString();
              result[0].hash.substring(1).should.be.eq(hash);
            });
          });
          context("The node in position 1", () => {
            it("Should have 'left' and 'right' nodes equals to the nodes in position 2 and 3 in the sorted input array", () => {
              result[1].left.should.be.eq(node_3);
              result[1].right.should.be.eq(node_4);
            });
            it("Should have 'hash' given by the combination of the hashes of the nodes in position 2 and 3 of the sorted input array", () => {
              const hash = sha256(node_3.hash + node_4.hash).toString();
              result[1].hash.substring(1).should.be.eq(hash);
            });
          });
        });
      });
    });
    context("From an input of N nodes", () => {
      it("Should have an output of length [N/2]+1 for N odd, and N/2 for N even (where [..] stands for the integer part, aka Floor)", () => {
        for (let i = 0; i < 500; i++) {
          const rand_n = Math.floor(Math.random() * 50);
          let mTreeNodes = [];
          for (let j = 0; j < rand_n; j++) {
            mTreeNodes.push(new MTreeNode("hash_" + i + "_" + j));
          }
          mTreeNodes.length % 2 === 0
            ? MTree.compute_layer(mTreeNodes).length.should.be.eq(
                mTreeNodes.length / 2
              )
            : MTree.compute_layer(mTreeNodes).length.should.be.eq(
                Math.floor(mTreeNodes.length / 2) + 1
              );
        }
      });
    });
  });

  context("The method compute_root", () => {
    context("For an array of 2 nodes", () => {
      const node_1 = new MTreeNode("hash_1");
      const node_2 = new MTreeNode("hash_2");
      const root = MTree.compute_root([node_1, node_2]);
      const sorted_input = MTreeNode.sort([node_1, node_2]);
      it("Should return a single node", () => {
        root.should.be.instanceOf(MTreeNode);
      });
      it("Should return a non-leaf node", () => {
        root.is_leaf().should.be.eq(false);
      });
      it("Should return a node with hash equals to the combination of the input nodes' hashes", () => {
        const hash = sha256(
          sorted_input[0].hash + sorted_input[1].hash
        ).toString();

        root.hash.substring(1).should.be.eq(hash);
      });
    });
  });

  context("Consider the following default constructed MTree", () => {
    const node_1 = new MTreeNode("hash_1");
    const node_2 = new MTreeNode("hash_2");
    const node_3 = new MTreeNode("hash_3");

    context("For a 3-leaves MTree", () => {
      const mTree = new MTree(["hash_1", "hash_2", "hash_3"]);

      const sorted_input = MTreeNode.sort([node_1, node_2, node_3]);

      const node_12 = new MTreeNode("", sorted_input[0], sorted_input[1]);
      const node_33 = new MTreeNode(
        "",
        sorted_input[2],
        sorted_input[2].clone()
      );

      const root = new MTreeNode("", node_12, node_33);

      it("The root element should be correct", () => {
        mTree.root.should.be.deep.eq(root);
      });
    });

    context("For a 4-leaves MTree", () => {
      const mTree = new MTree(["hash_1", "hash_2", "hash_3", "hash_4"]);

      const node_4 = new MTreeNode("hash_4");
      const sorted_input = MTreeNode.sort([node_1, node_2, node_3, node_4]);

      const node_12 = new MTreeNode("", sorted_input[0], sorted_input[1]);
      const node_34 = new MTreeNode("", sorted_input[2], sorted_input[3]);

      const root = new MTreeNode("", node_12, node_34);

      it("The root element should be correct", () => {
        mTree.root.should.be.deep.eq(root);
      });
    });
  });

  context("The method fill_matrix", () => {
    it("Should return a matrix", () => {
      let mTree = new MTree(["hash_1", "hash_2", "hash_3"]);
      mTree.matrix.should.be.a("array");
      for (let i in mTree.matrix) {
        mTree.matrix[i].should.be.a("array");
      }
    });
    context("For a 3-leaves constructed MTree", () => {
      it("Should correctly put the hashes of the nodes in the matrix", () => {
        const mTree = new MTree(["hash_1", "hash_2", "hash_3"]);
        mTree.fill_matrix();

        const node_1 = new MTreeNode("hash_1");
        const node_2 = new MTreeNode("hash_2");
        const node_3 = new MTreeNode("hash_3");
        const sorted_input = MTreeNode.sort([node_1, node_2, node_3]);

        const node_12 = new MTreeNode("", sorted_input[0], sorted_input[1]);
        const node_33 = new MTreeNode(
          "",
          sorted_input[2],
          sorted_input[2].clone()
        );

        const root = new MTreeNode("", node_12, node_33);

        const matrix = [
          [root.hash],
          [node_12.hash, node_33.hash],
          [
            sorted_input[0].hash,
            sorted_input[1].hash,
            sorted_input[2].hash,
            sorted_input[2].hash,
          ],
        ];
        mTree.matrix.should.have.deep.members(matrix);
      });
    });
  });
  context("The method construct_proof", () => {
    const mTree = new MTree(["hash_1", "hash_2", "hash_3", "hash_4"]);
    mTree.fill_matrix();
    const node_1 = new MTreeNode("hash_1");
    const node_2 = new MTreeNode("hash_2");
    const node_3 = new MTreeNode("hash_3");
    const node_4 = new MTreeNode("hash_4");
    const sorted_input = MTreeNode.sort([node_1, node_2, node_3, node_4]);

    const node_12 = new MTreeNode("", sorted_input[0], sorted_input[1]);
    const node_34 = new MTreeNode("", sorted_input[2], sorted_input[3]);

    const root = new MTreeNode("", node_12, node_34);

    it("Should return a MTreeProof type object", () => {
      mTree.construct_proof.should.be.instanceOf(Function);
      mTree.construct_proof().should.be.instanceOf(MTreeProof);
    });
    context(
      "For a MTree constructed with [node_1, node_2, node_3, node_4]",
      () => {
        context("And for an input of node_2", () => {
          it("Should build a MTreeProof with hashes array = [node_2.hash, node_1.hash, node_34.hash] and permute array = [1,0]", () => {
            const proof = mTree.construct_proof(sorted_input[1].hash);
            proof.should.be.deep.eq(
              new MTreeProof(
                [sorted_input[1].hash, sorted_input[0].hash, node_34.hash],
                [1, 0]
              )
            );
          });
        });
      }
    );
  });

  context("The method verify", () => {
    const mTree = new MTree(["hash_1", "hash_2", "hash_3", "hash_4"]);
    mTree.fill_matrix();
    const node_1 = new MTreeNode("hash_1");
    const node_2 = new MTreeNode("hash_2");
    const node_3 = new MTreeNode("hash_3");
    const node_4 = new MTreeNode("hash_4");
    const sorted_input = MTreeNode.sort([node_1, node_2, node_3, node_4]);
    console.log(sorted_input);

    const node_12 = new MTreeNode("", sorted_input[0], sorted_input[1]);
    const node_34 = new MTreeNode("", sorted_input[2], sorted_input[3]);

    console.log([node_12, node_34]);

    const root = new MTreeNode("", node_12, node_34);

    it("Should return a boolean", () => {
      const proof = new MTreeProof(
        [sorted_input[1].hash, sorted_input[0].hash, node_34.hash],
        [1, 0]
      );
      mTree.verify.should.be.instanceOf(Function);
      mTree.verify(proof).should.be.a("boolean");
    });

    it("Should return true for a correct proof", () => {
      const proof = new MTreeProof(
        [sorted_input[1].hash, sorted_input[0].hash, node_34.hash],
        [1, 0]
      );
      mTree.verify(proof).should.be.eq(true);
    });

    it("Should return false for an incorrect proof", () => {
      const proof = new MTreeProof(
        [sorted_input[3].hash, sorted_input[2].hash, node_12.hash],
        [1, 0]
      );
      mTree.verify(proof).should.be.eq(false);
    });
  });
});
