const sha256 = require("crypto-js/sha256");
const MTreeNode = require("./MTreeNode");

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

    const left = new MTreeNode(hashes[0]);
    const right = new MTreeNode(hashes[1]);
    this.root = new MTreeNode("boh", left, right);
  }

  static compute_layer(_nodes) {
    const nodes = shuffle(_nodes);
    let ret = [];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        ret.push(new MTreeNode("", nodes[i], nodes[i + 1]));
      } else {
        ret.push(nodes[i - 1]);
      }
    }
    return ret;
  }
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

module.exports = MTree;
