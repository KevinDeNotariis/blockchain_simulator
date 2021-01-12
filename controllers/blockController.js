const mongoose = require("mongoose");

const Hash = mongoose.model("Hash");
const Block = mongoose.model("Block");

const mine_block = (req, res, next) => {
  const block = new Block(req.body);

  block.mine_block();

  req.body.nonce = block.nonce;

  next();
};

//----------- create_block -----------------
/*
    Once the user has created the transactions pool,
    it creates the block, by looking at the blockchain
    and retrieving the last block, since they need
    to incorporate the new block id and the previous_hash
    in the block they are trying to mine
*/

const create_block = (req, res, next) => {
  req.body = {
    id: req.app.locals.max_id + 1,
    previous_hash: req.app.locals.previous_hash,
    transactions: req.body.transactions,
  };
  next();
};

const checks = async (req, res, next) => {
  const block = new Block(req.body);
  console.log("\n\nINSIDE checks, CHECKING VALIDITY OF A BLOCK");
  console.log("  - block we are inspecting:");
  console.log(block);

  //check if the node has already this block
  console.log("  - checking whether we already have this block");

  let hash = await Hash.findOne({
    block_hash: block.hash(),
    block_id: block.id,
  });

  if (hash) {
    console.log("Already got that block");
    return res.status(400).json({ message: "Already got that block" });
  }

  console.log(
    "  - block is not in the local blockchain, continuing validity checks."
  );

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
  hash = await Hash.findOne({ block_hash: block.previous_hash });
  if (!hash)
    return res.status(400).json({ message: "Previous Block not found" });

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
  checks,
  create_block,
  mine_block,
};
