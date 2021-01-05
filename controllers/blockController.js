const { Block, Transaction } = require("../Block");
const fs = require("fs");

const fetchTransactions = () => {
  return JSON.parse(fs.readFileSync("transactions.json"));
};

const fetchBlocks = () => {
  return JSON.parse(fs.readFileSync("blockchain.json"));
};

const hash_block = (req, res) => {
  let transactions = constructTransactions(req.query.transactions_id);

  transactions.map((elem) => console.log(elem));

  let block = new Block(req.query.id, req.query.previous_hash, transactions);
  block.nonce = req.query.nonce;

  block.hash_block(block.target);

  return res.status(200).json({ hash: block.hash });
};

const mine_block = (req, res) => {
  console.log("INSIDE THE MIDDLEWARE HANDLING THE MINE OF A BLOCK");
  console.log("  Retrieving the Transactions from their IDs:");
  req.query.transactions_id.map((elem) => {
    console.log("   " + elem);
  });
  let transactions = constructTransactions(req.query.transactions_id);

  console.log("  Obtained the transactions");
  console.log("  Approaching to mine the block");

  let block = new Block(req.query.id, req.query.previous_hash, transactions);

  block.mine_block(block.target);

  return res.status(200).json({ hash: block.hash, nonce: block.nonce });
};

const constructTransactions = (transactions_id) => {
  console.log(
    "INSIDE THE FUNCTION WHICH FETCH THE TRANSACTIONS FROM THEIR IDS"
  );
  let ret = [];
  let total_transactions = fetchTransactions();

  for (transaction_id in transactions_id) {
    for (tr in total_transactions) {
      if (total_transactions[tr].id == transactions_id[transaction_id]) {
        let new_tr = new Transaction(
          total_transactions[tr].sender,
          total_transactions[tr].receiver,
          total_transactions[tr].amount
        );
        new_tr.id = total_transactions[tr].id;
        ret.push(new_tr);
        break;
      }
    }
  }
  return ret;
};

module.exports = {
  fetchTransactions,
  fetchBlocks,
  mine_block,
  hash_block,
};
