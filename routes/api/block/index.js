const express = require("express");

const blockController = require("../../../controllers/blockController");

const router = express.Router();

module.exports = () => {
  router.get("/last", blockController.get_last, (req, res) => {
    return res
      .status(200)
      .json({ message: "Last block retrieved", block: req.body.block });
  });

  router.put(
    "/",
    blockController.checks,
    blockController.save_block,
    blockController.propagate_block
  );

  router.get("/validate", blockController.checks, (req, res) => {
    return res.status(200).json({
      message: "Block valid",
      validation: req.body.validation,
      block: req.body.block,
    });
  });

  return router;
};
