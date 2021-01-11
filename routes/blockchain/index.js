const express = require("express");

const {
  add_genesis_block,
  get_blockchain,
  add_block,
} = require("../../controllers/blockchainController");

const { propagate_block } = require("../../controllers/nodeController");

const router = express.Router();

module.exports = () => {
  router.post("/add_genesis_block", add_genesis_block);

  router.get("/get_blockchain", get_blockchain);

  router.post("/add_block", add_block, propagate_block);

  return router;
};
