const express = require("express");

const nodeController = require("../../../controllers/nodeController");

const blockController = require("../../../controllers/blockController");

const blockchainController = require("../../../controllers/blockchainController");

const router = express.Router();

module.exports = () => {
  router.post("/add_node", nodeController.add_node);

  router.post(
    "/mine",
    nodeController.create_txs_pool,
    blockController.create_block,
    blockController.mine_block,
    blockchainController.add_block,
    nodeController.propagate_block
  );

  router.post(
    "/accept_block",
    blockController.checks,
    blockchainController.add_block,
    nodeController.propagate_block
  );

  router.get("/get_peers", nodeController.get_peers);

  router.get("/discover_peers", nodeController.discover_peers);

  router.post("/wake_up", nodeController.discover_peers);

  return router;
};
