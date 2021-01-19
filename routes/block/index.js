const express = require("express");

const {
  mine_block,
  get_blocks_from_id,
} = require("../../controllers/blockController");

const router = express.Router();

module.exports = () => {
  router.post("/mine_block", mine_block);

  router.get("/get_blocks_from_id", get_blocks_from_id);

  return router;
};
