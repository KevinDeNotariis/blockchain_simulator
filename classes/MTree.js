const sha256 = require("crypto-js/sha256");
const MTreeNode = require("./MTreeNode");
const MTreeProof = require("./MTreeProof");

class MTree {
  constructor(hashes) {
    if (hashes === undefined) {
      throw new TypeError("MTree needs an argument in the constructor");
    } else if (!(hashes instanceof Array)) {
      throw new TypeError("MTree constructor param needs to be an array");
    }

    hashes.map((elem) => {
      if (typeof elem !== "string") {
        throw new TypeError(
          "MTree constructor param array must be an array of strings"
        );
      }
    });

    const nodes = [];
    for (let i in hashes) {
      nodes.push(new MTreeNode(hashes[i]));
    }
    MTreeNode.sort(nodes);
    this.root = MTree.compute_root(nodes);
    this.matrix = [];
  }

  fill_matrix() {
    let temporary = [];
    let tree = [];
    let nodes = [];

    let current = this.root;
    let level = 1;

    temporary.push(current);
    tree.push([current.hash]);

    while (temporary.length > 0) {
      if (nodes.length >= Math.pow(2, level)) {
        tree.push(nodes.map((a) => (a === undefined ? undefined : a.hash)));
        nodes = [];
        level += 1;
      }

      current = temporary.shift();

      if (current !== undefined) {
        let left = current.left;
        let right = current.right;

        temporary.push(left);
        nodes.push(left);

        temporary.push(right);
        nodes.push(right);
      } else {
        nodes.push(undefined);
        nodes.push(undefined);
      }
    }
    if (nodes.length > 0) {
      tree.push(nodes.map((a) => (a === undefined ? undefined : a.hash)));
    }

    this.matrix = tree.slice(0, tree.length - 2);

    return this;
  }

  static compute_root(nodes) {
    if (nodes.length !== 2) {
      return this.compute_root(this.compute_layer(nodes));
    } else {
      return new MTreeNode("", nodes[0], nodes[1]);
    }
  }

  static compute_layer(nodes) {
    let ret = [];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        ret.push(new MTreeNode("", nodes[i], nodes[i + 1]));
      } else {
        ret.push(new MTreeNode("", nodes[i], nodes[i].clone()));
      }
    }
    return ret;
  }

  construct_proof(hash) {
    if (this.matrix.length === 0) this.fill_matrix();
    let ret = [hash];
    let permute = [];
    let reversed_matrix = this.matrix.reverse();

    let position = reversed_matrix[0].findIndex((value) => value === hash);
    ret.push(
      position % 2 === 0
        ? reversed_matrix[0][position + 1]
        : reversed_matrix[0][position - 1]
    );
    permute.push(position % 2 === 0 ? 0 : 1);
    for (let i = 1; i < reversed_matrix.length - 1; i++) {
      let left, right;
      if (permute[permute.length - 1]) {
        left = ret[ret.length - 1];
        right = ret[ret.length - 2];
      } else {
        left = ret[ret.length - 2];
        right = ret[ret.length - 1];
      }
      let current_hash = "1" + sha256(left + right).toString();
      position = reversed_matrix[i].findIndex(
        (value) => value === current_hash
      );
      ret.push(
        position % 2 === 0
          ? reversed_matrix[i][position + 1]
          : reversed_matrix[i][position - 1]
      );
      permute.push(position % 2 === 0 ? 0 : 1);
    }
    this.matrix.reverse();
    return new MTreeProof(ret, permute);
  }

  depth_first_search({ node, path, permute }) {
    let ret = {
      node: _node,
      path: _path,
      permute: _permute,
    };
    if (ret.path[ret.path.length - 1] !== ret.node) {
      if (ret.path[ret.path.length - 1].left !== undefined) {
        ret.path.push(ret.path[ret.path.length - 1].left);
        this.depth_first_search(ret);
        if (ret.path[ret.path.length - 1] === ret.node) return ret;
        ret.path.pop();
      } else {
        return;
      }
      if (ret.path[ret.path.length - 1].right !== undefined) {
        ret.path.push(ret.path[ret.path.length - 1].right);
        this.depth_first_search(ret);
        if (ret.path[ret.path.length - 1] === ret.node) return ret;
        ret.path.pop();
      } else {
        return;
      }
    }
    return ret;
  }

  verify(mTreeProof) {
    let { hashes, permute } = { ...mTreeProof };
    let n = hashes.length;
    for (let i = 0; i < n; i++) {
      if (hashes.length === 1) return false;
      let current_hash;
      if (permute.shift()) {
        current_hash = "1" + sha256(hashes[0 + 1] + hashes[0]).toString();
      } else {
        current_hash = "1" + sha256(hashes[0] + hashes[0 + 1]).toString();
      }
      if (current_hash === this.root.hash) return true;
      hashes.shift();
      hashes[0] = current_hash;
    }
    return false;
  }
}

module.exports = MTree;
