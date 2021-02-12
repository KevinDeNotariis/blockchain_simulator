const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction");

const TransactionClass = require("../classes/Transaction");

const configuration = require("../config");

const create_txs_pool = async (req, res, next) => {
  const txs = await Transaction.find({});
  let txs_pool = [];
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
  if (txs_pool.length === 0) {
    return res.status(400).json({ message: "No transactions in the pool" });
  }
  req.body.transactions = txs_pool;
  next();
};

module.exports = {
  create_txs_pool,
};
