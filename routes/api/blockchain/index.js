const express = require("express");

const blockController = require("../../../controllers/blockchainController");

const nodeController = require("../../../controllers/nodeController");

const router = express.Router();

module.exports = () => {
  router.post("/add_genesis_block", blockController.add_genesis_block);

  router.post(
    "/add_block",
    blockController.add_block,
    nodeController.propagate_block
  );

  return router;
};
