const sha256 = require("crypto-js/sha256");

class MTreeNode {
  constructor(hash, left = undefined, right = undefined) {
    if (
      (left === undefined && right !== undefined) ||
      (left !== undefined && right === undefined)
    ) {
      throw new TypeError(
        "A Node can be constructed with 0 or 2 children, not 1"
      );
    }

    this.left = left;
    this.right = right;

    if (left === undefined && right === undefined) {
      this.hash = (0x00).toString() + sha256(hash).toString();
    } else {
      this.hash =
        (0x01).toString() + sha256(this.left.hash + this.right.hash).toString();
    }
  }

  is_leaf() {
    return this.hash.substring(0, 1) === "0" ? true : false;
  }

  clone() {
    let ret = new MTreeNode(this.hash, this.left, this.right);
    ret.hash = this.hash;
    return ret;
  }

  static sort(nodes) {
    return nodes.sort((a, b) => parseInt(a.hash, 16) - parseInt(b.hash, 16));
  }
}

module.exports = MTreeNode;
