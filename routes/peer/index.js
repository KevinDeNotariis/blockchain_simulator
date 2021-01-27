const express = require("express");

const { get_peers } = require("../../utilities/dbManagement");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const peers = await get_peers();

    return res.render("index", {
      title: "Peers",
      page: "peer/index",
      styles: ["peer", "table"],
      script: "peer",
      peers: peers,
    });
  });

  return router;
};
