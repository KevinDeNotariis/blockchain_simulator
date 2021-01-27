const express = require("express");

const nodeRoute = require("./node");
const transactionRoute = require("./transaction");
const blockRoute = require("./block");
const blockchainRoute = require("./blockchain");
const userRoute = require("./user");
const peerRoute = require("./peer");

const setUpRoute = require("./set_up");

const {
  get_blockchain,
  get_transactions,
  get_peers,
} = require("../utilities/dbManagement");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const transactions = await get_transactions();
    const blocks = await get_blockchain();
    const peers = await get_peers();

    return res.render("index", {
      title: `Peer at localhost:${req.app.locals.config.port}`,
      page: "index",
      styles: ["home", "buttons"],
      script: "home",
      transactions: transactions,
      blocks: blocks,
      peers: peers,
    });
  });

  router.use("/node", nodeRoute());
  router.use("/transaction", transactionRoute());
  router.use("/block", blockRoute());
  router.use("/blockchain", blockchainRoute());
  router.use("/user", userRoute());
  router.use("/peer", peerRoute());
  router.use("/set_up", setUpRoute());

  return router;
};
