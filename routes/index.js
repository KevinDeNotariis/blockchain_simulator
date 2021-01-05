const express = require("express");

const {
  hash_block,
  mine_block,
  fetchTransactions,
  fetchBlocks,
} = require("../controllers/blockController");

const router = express.Router();

module.exports = () => {
  const transactions = fetchTransactions();
  const blocks = fetchBlocks();

  router.get("/", (req, res) => {
    return res.render("index", {
      title: "Blockchain",
      style: "home",
      script: "home",
      transactions: transactions,
      blocks: blocks,
    });
  });

  router.get("/mine_block", mine_block);
  router.get("/hash_block", hash_block);

  return router;
};
