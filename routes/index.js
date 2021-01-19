const express = require("express");

const nodeRoute = require("./node");
const transactionRoute = require("./transaction");
const blockRoute = require("./block");
const blockchainRoute = require("./blockchain");
const userRoute = require("./user");

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
      title: "Home Page",
      page: "blockchain/index",
      style: "home",
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

  return router;
};
