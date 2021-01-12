const express = require("express");

const {
  add_node,
  create_txs_pool,
  propagate_block,
  get_peers,
  discover_peers,
} = require("../../controllers/nodeController");

const {
  checks,
  mine_block,
  create_block,
} = require("../../controllers/blockController");

const { add_block } = require("../../controllers/blockchainController");

const router = express.Router();

module.exports = () => {
  router.post("/add_node", add_node);

  router.post(
    "/mine",
    create_txs_pool,
    create_block,
    mine_block,
    add_block,
    propagate_block
  );

  router.post("/accept_block", checks, add_block, propagate_block);

  router.get("/get_peers", get_peers);

  router.get("/discover_peers", discover_peers);

  return router;
};
