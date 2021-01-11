const mongoose = require("mongoose");

const Block = mongoose.model("Block");
const Transaction = mongoose.model("Transaction");

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

  genesis_block.save((err, block) => {
    if (err) res.status(401).json({ message: err });

    return res.status(200).json(block);
  });
};

const get_blockchain = (req, res) => {
  Block.find((err, blockchain) => {
    if (err) return res.status(401).json({ message: err });

    if (!blockchain)
      return res.status(400).json({ message: "Block not found" });

    return res.status(200).json(blockchain);
  });
};

const add_block = (req, res, next) => {
  console.log("INSIDE add_block of BLOCKCHAIN CONTROLLER");
  console.log("  - trying to add the following block:");
  console.log(req.body);
  const block = new Block(req.body);

  block.save((err, block) => {
    if (err) return res.status(401).json({ message: err });

    console.log("  - block added successfully to the blockchain");
    console.log("  - updating the max_id and previous_hash:");

    req.app.locals.max_id = block.id;
    req.app.locals.previous_hash = block.hash();

    console.log(`    max_id: ${req.app.locals.max_id}`);
    console.log(`    previous_hash: ${req.app.locals.previous_hash}`);

    next();
  });
};

module.exports = { add_genesis_block, get_blockchain, add_block };