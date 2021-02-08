const express = require("express");

const dbManagement = require("../../utilities/dbManagement");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const blocks = await dbManagement.get_blockchain();

    return res.render("index", {
      title: "Blockchain",
      page: "blockchain/index",
      styles: ["blockchain"],
      script: "blockchain",
      blocks: blocks,
    });
  });

  return router;
};
