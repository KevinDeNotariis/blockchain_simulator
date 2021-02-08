const express = require("express");

const blockController = require("../../../controllers/blockController");

const router = express.Router();

module.exports = () => {
  router.post("/mine_block", blockController.mine_block);

  router.get("/get_blocks_from_id", blockController.get_blocks_from_id);

  return router;
};
