const express = require("express");

const {
  add_node,
  create_txs_pool,
  propagate_block,
} = require("../../controllers/nodeController");

const {
  is_valid,
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

  router.post("/accept_block", is_valid, add_block, (req, res) => {
    return res.status(200).json({ message: "We got it" });
  });

  return router;
};
