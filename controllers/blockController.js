const qs = require("qs");

const mongoose = require("mongoose");

const Hash = mongoose.model("Hash");
const Block = mongoose.model("Block");

const mine_block = (req, res, next) => {
  const block = new Block(req.body);

  block.mine_block();

  req.body.nonce = block.nonce;

  next();
};

const create_block = (req, res, next) => {
  req.body = {
    id: req.app.locals.max_id + 1,
    previous_hash: req.app.locals.previous_hash,
    transactions: req.body.transactions,
  };
  next();
};

const is_valid = async (req, res, next) => {
  const block = new Block(req.body);
  console.log("INSIDE is_valid, CHECKING VALIDITY OF A BLOCK");
  console.log("  block we are inspecting:");
  console.log(block);

  // check if the hash satisfies the difficulty
  console.log("  - checking whether the block satisfy the diffulty");
  if (block.hash() >= block.target)
    return res
      .status(400)
      .json({ message: "Block do not satisfy the difficulty" });

  console.log("    difficulty okay.");
  console.log("  - checking whether the previous_hash is in the blockchain");
  // check if the previous_hash corresponds to a block in the local blockchain
  // by checking whether this hash is in the HashSchema
  await Hash.find({ block_hash: block.previous_hash }, (err, hash) => {
    if (err) return res.status(401).json({ message: err });

    if (!hash)
      return res.status(400).json({ message: "Previous Block not found" });
  });
  console.log("    previous block found.");

  console.log("  - checking whether the transactions are valid");
  // check whether the transactions are valid
  block.transactions.map((tx) => {
    if (!tx.verify()) {
      return res.status(400).json({ message: "Transactions not valid" });
    }
  });
  console.log("    transactions are valid.");

  console.log("  - exiting is_valid middleware.");
  next();
};

module.exports = {
  create_block,
  mine_block,
  is_valid,
};
