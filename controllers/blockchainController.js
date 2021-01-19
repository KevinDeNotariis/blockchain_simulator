const mongoose = require("mongoose");

const Block = mongoose.model("Block");
const Transaction = mongoose.model("Transaction");
const Hash = mongoose.model("Hash");

const add_genesis_block = (req, res) => {
  const genesis_transaction = new Transaction({
    id: "0000000000000000",
    sender: "0000000000000000",
    receiver: "0000000000000000",
    amount: 0,
  });
  const genesis_block = new Block({
    id: 0,
    previous_hash: "0000000000000000",
    transactions: [genesis_transaction],
  });

  genesis_block.mine_block();

  req.app.locals.previous_hash = genesis_block.hash();
  req.app.locals.max_id = 0;

  genesis_block.save((err, block) => {
    if (err) res.status(401).json({ message: err });

    const hash = new Hash({
      block_hash: req.app.locals.previous_hash,
      block_id: req.app.locals.max_id,
    });

    hash.save((err, doc) => {
      if (err) return res.status(401).json({ message: err });
    });

    return res.status(200).json(block);
  });
};

const get_blockchain = (req, res) => {
  Block.find((err, blockchain) => {
    if (err) return res.status(401).json({ message: err });

    if (blockchain.length === 0)
      return res.status(400).json({ message: "No blocks found" });

    return res.status(200).json(blockchain);
  });
};

const add_block = async (req, res, next) => {
  console.log("INSIDE add_block of BLOCKCHAIN CONTROLLER");
  console.log("  - trying to add the following block:");
  console.log(req.body);
  const block = new Block(req.body);

  await block.save();

  console.log("  - block added successfully to the blockchain");
  console.log("  - updating the max_id and previous_hash:");

  req.app.locals.max_id = block.id;
  req.app.locals.previous_hash = block.hash();

  console.log(`    max_id: ${req.app.locals.max_id}`);
  console.log(`    previous_hash: ${req.app.locals.previous_hash}`);

  console.log("  - adding block hash and block id to the Hash collection");
  const hash = new Hash({
    block_hash: req.app.locals.previous_hash,
    block_id: req.app.locals.max_id,
  });

  await hash.save();

  console.log("    (block_hash, block_id) added to the hashes collection");

  next();
};

module.exports = { add_genesis_block, get_blockchain, add_block };
