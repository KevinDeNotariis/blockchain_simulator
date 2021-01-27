const express = require("express");

const {
  add_genesis_block,
  add_block,
} = require("../../controllers/blockchainController");

const { propagate_block } = require("../../controllers/nodeController");

const {
  get_blockchain,
  get_transactions,
  get_peers,
} = require("../../utilities/dbManagement");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const transactions = await get_transactions();
    const blocks = await get_blockchain();
    const peers = await get_peers();

    return res.render("index", {
      title: "Blockchain",
      page: "blockchain/index",
      styles: ["blockchain"],
      script: "blockchain",
      transactions: transactions,
      blocks: blocks,
      peers: peers,
    });
  });

  router.post("/add_genesis_block", add_genesis_block);

  //router.get("/get_blockchain", get_blockchain);

  router.post("/add_block", add_block, propagate_block);

  return router;
};
