const mongoose = require("mongoose");

const Block = mongoose.model("Block");
const Hash = mongoose.model("Hash");

const TransactionClass = require("../classes/Transaction");
const BlockClass = require("../classes/Block");

const configuration = require("../config");

const add_genesis_block = async (req, res, next) => {
  const genesis_transaction = new TransactionClass(
    configuration.config.coinbase.public,
    configuration.config.coinbase.public,
    configuration.config.setUp.initial_money
  );

  genesis_transaction.sign(configuration.config.coinbase.private);

  const genesis_block = new BlockClass();
  genesis_block.init(
    0,
    "0000000000000000",
    configuration.config.setUp.initial_difficulty,
    [genesis_transaction]
  );

  genesis_block.mine();

  req.app.locals.previous_hash = genesis_block.hash();
  req.app.locals.max_id = 0;

  const genesis_block_db = new Block(genesis_block);

  await genesis_block_db.save();

  const hash = new Hash({
    block_hash: req.app.locals.previous_hash,
    block_id: req.app.locals.max_id,
  });

  await hash.save();

  next();
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
