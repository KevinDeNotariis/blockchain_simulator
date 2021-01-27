const express = require("express");

const {
  add_genesis_block,
  add_block,
} = require("../../controllers/blockchainController");

const { propagate_block } = require("../../controllers/nodeController");

const dbManagement = require("../../utilities/dbManagement");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const blocks = await dbManagement.get_blockchain();

    return res.render("index", {
      title: "Blockchain",
      page: "blockchain/index",
      styles: ["blockchain"],
      script: "blockchain",
      blocks: blocks,
    });
  });

  router.post("/add_genesis_block", add_genesis_block);

  //router.get("/get_blockchain", get_blockchain);

  router.post("/add_block", add_block, propagate_block);

  return router;
};
