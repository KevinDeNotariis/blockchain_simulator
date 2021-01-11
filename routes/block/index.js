const express = require("express");

const { mine_block } = require("../../controllers/blockController");

const router = express.Router();

module.exports = () => {
  router.post("/mine_block", mine_block);

  return router;
};
