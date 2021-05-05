const Transaction = require("../models/transactionModel");

const TransactionClass = require("../classes/Transaction");

const configuration = require("../config");

const create_txs_pool = async (req, res, next) => {
  const txs = await Transaction.find({});
  let txs_pool = [];

  txs_pool.push(
    new TransactionClass(
      configuration.config.coinbase.public,
      req.app.locals.config.public_key,
      configuration.config.mining_reward
    )
  );

  //signing the transaction
  if (!txs_pool[0].sign(configuration.config.coinbase.private)) {
    console.log("Error in signing the coinbase transaction");
    return res
      .status(400)
      .json({ message: "Error in signing the coinbase transaction" });
  }

  for (
    let i = 0;
    i < configuration.config.max_txs_in_block && i < txs.length;
    i++
  ) {
    if (txs[i].verify()) {
      const tx = new TransactionClass(txs[i]);
      txs_pool.push(tx);
    } else {
      i--;
    }
  }
  if (txs_pool.length === 1) {
    return res.status(400).json({ message: "No transactions in the pool" });
  }
  req.body.transactions = txs_pool;
  next();
};

module.exports = {
  create_txs_pool,
};
