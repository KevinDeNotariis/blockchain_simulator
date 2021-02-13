const express = require("express");

const nodeController = require("../../../controllers/nodeController");

const blockController = require("../../../controllers/blockController");

const blockchainController = require("../../../controllers/blockchainController");

const router = express.Router();

module.exports = () => {
  router.post(
    "/mine",
    nodeController.create_txs_pool,
    blockController.create_block,
    blockController.mine_block,
    blockController.save_block,
    blockController.propagate_block
  );

  return router;
};
