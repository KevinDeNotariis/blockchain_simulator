const Hash = require("../models/hashModel");
const Block = require("../models/blockModel");
const Transaction = require("../models/transactionModel");

const BlockClass = require("../classes/Block");
const TransactionClass = require("../classes/Transaction");

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

  console.log(
    "  - Checking whether the first transaction is from the coinbase"
  );
  if (block.transactions[0].sender !== configuration.config.coinbase.public) {
    console.log("    first transaciton is not from the coinbase");
    return res
      .status(400)
      .json({ message: "First transaction is not from the coinbase" });
  }

  console.log("    first transaciton is from the coinbase");

  console.log("  - Checking whether no other transaction is from the coinbase");
  for (let i = 1; i < block.transactions.length; i++) {
    if (block.transactions[i].sender === configuration.config.coinbase.public) {
      console.log(
        "    found another transaction form the coinbase, this cannot happen"
      );
      return res
        .status(400)
        .json({ message: "Found another transaction from the coinbase" });
    }
  }
  console.log("    no other transactions are from the coinbase");

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

  for (let i in validation) {
    if (validation[i].message !== "Transaction valid") {
      console.log("A transaction is not valid, received the following message");
      console.log(validation[i]);
      return res
        .status(400)
        .json({ message: "A transaction in the block is not valid" });
    }
  }

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

  console.log(
    "  - Removing transactions in the block from the transaction pool"
  );

  for (let i in block.transactions) {
    const tx = await Transaction.findOne({
      id: block.transactions[i].id,
    });
    if (tx) {
      await Transaction.deleteOne(tx);
    }
  }

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

const get_genesis_block = async (req, res, next) => {
  const genesis_transaction = new TransactionClass(
    configuration.config.coinbase.public,
    configuration.config.coinbase.public,
    configuration.config.setUp.initial_money
  );

  genesis_transaction.sign(configuration.config.coinbase.private);

  const genesis_block = new BlockClass();

  genesis_block.init(
    0,
    configuration.config.genesis_block.previous_hash,
    configuration.config.setUp.initial_difficulty,
    [genesis_transaction]
  );

  genesis_block.mine();

  req.body.block = genesis_block;

  next();
};

const save_genesis_block = async (req, res, next) => {
  const block = new Block(req.body.block);

  await block.save();

  const hash = new Hash({
    block_id: block.header.id,
    block_hash: block.hash(),
  });

  await hash.save();

  delete req.body.block;

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
  get_genesis_block,
  save_genesis_block,
};
