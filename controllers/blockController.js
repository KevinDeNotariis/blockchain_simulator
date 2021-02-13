const mongoose = require("mongoose");
const http = require("http");

const Hash = mongoose.model("Hash");
const Block = mongoose.model("Block");

const BlockClass = require("../classes/Block");

const functions = require("../utilities/functions");
const dbManagement = require("../utilities/dbManagement");

const configuration = require("../config");

const mine_block = (req, res, next) => {
  let block = new BlockClass();
  block.init(req.body.block);

  block.mine();

  req.body.block = block;

  next();
};

const create_block = async (req, res, next) => {
  let block = new BlockClass();

  block.init(
    (await dbManagement.get_max_id()) + 1,
    await dbManagement.get_previous_hash(),
    configuration.config.setUp.initial_difficulty,
    req.body.transactions
  );
  delete req.body.transactions;
  req.body.block = block;

  next();
};

const checks = async (req, res, next) => {
  const block = new BlockClass();
  block.init(req.body.block);

  console.log("\n\nINSIDE checks, CHECKING VALIDITY OF A BLOCK");
  console.log("  - block we are inspecting:");
  console.log(block.header);

  //check if the node has already this block
  console.log("  - checking whether we already have this block");

  let hash = await Hash.findOne({
    block_hash: block.hash(),
    block_id: block.header.id,
  });

  if (hash) {
    console.log("Already got that block");
    return res.status(400).json({ message: "Already got that block" });
  }

  console.log(
    "  - block is not in the local blockchain, continuing validity checks."
  );

  // check if the hash satisfies the difficulty
  console.log(
    "  - checking whether the block satisfies the diffulty constraint"
  );
  if (!block.mined()) {
    return res
      .status(400)
      .json({ message: "Block does not satisfy the difficulty" });
  }

  console.log("    difficulty okay.");
  console.log("  - checking whether the previous_hash is in the blockchain");

  // check if the previous_hash corresponds to a block in the local blockchain
  // by checking whether this hash is in the HashSchema
  const prev_hash = await Hash.findOne({
    block_hash: block.header.previous_hash,
  });
  if (!prev_hash)
    return res.status(400).json({ message: "Previous Block not found" });

  console.log("    previous block found.");

  // checking whether the previous hash just found, is of a block with ID
  // equals to this block id minus 1.
  console.log(
    "  - checking whether the previous_hash is indeed the previous hash"
  );
  if (prev_hash.block_id < block.header.id - 1) {
    // The block might an orphan one.
    return res.status(400).json({
      message:
        "The previous_hash of this block, corresponds not to the last block, but to an older block",
    });
  } else if (prev_hash.block_id > block.header.id - 1) {
    return res.status(400).json({
      message:
        "The previous_hash of this block, corresponds to a block which has id greater.",
    });
  }
  console.log(
    "    previous block coincides with the one pointing by this block"
  );

  console.log("  - checking whether the transactions are valid");
  // check whether the transactions are valid -> calling API
  const validation = [];
  await Promise.all(
    block.transactions.map(async (tx) => {
      validation.push(
        await functions.partial_verify_transaction(
          req.app.locals.config.address,
          req.app.locals.config.port,
          tx
        )
      );
    })
  );
  console.log(validation);

  console.log("    transactions are valid.");

  req.body.validation = validation;
  next();
};

const save_block = async (req, res, next) => {
  console.log("\n\nINSIDE save_block, ATTEMPTING TO SAVE THE RECEIVED BLOCK");
  console.log("  - Block to save: ");
  console.log(req.body.block.header);
  const block = new Block(req.body.block);

  await block.save();

  console.log("  --> Block saved");

  console.log("  - Saving the hashes and ID in the hashes collection");
  const hash = new Hash({
    block_id: block.header.id,
    block_hash: block.hash(),
  });
  await hash.save();

  console.log("  --> Hash saved");

  next();
};

const propagate_block = async (req, res) => {
  console.log("\n\nINSIDE propagate_block TRYING TO PROPAGATE BLOCK TO PEERS");

  const ret = await functions.propagate_to_peers(
    { block: req.body.block },
    "/api/block",
    "PUT"
  );

  console.log("Block sent");

  return res.status(200).json({ message: ret, block: req.body.block });
};

const get_last = async (req, res, next) => {
  const max_id = await dbManagement.get_max_id();

  const block = await Block.findOne({ "header.id": max_id });

  req.body.block = block.header;

  next();
};

const get_block_by_id = async (req, res, next) => {
  const id = req.params.id;
  const block = await Block.findOne({ "header.id": id });
  if (!block)
    return res.status(400).json({ message: "No block with such id", id: id });

  const ret_block = new BlockClass();

  ret_block.init(block);

  req.body.block = ret_block;
  next();
};

module.exports = {
  checks,
  create_block,
  mine_block,
  save_block,
  propagate_block,
  get_last,
  get_block_by_id,
};
