const express = require("express");

const nodeRoute = require("./node");
const transactionRoute = require("./transaction");
const blockRoute = require("./block");
const blockchainRoute = require("./blockchain");
const userRoute = require("./user");

const router = express.Router();

module.exports = () => {
  router.get("/", (req, res) => {
    return res.render("index", {
      title: "Blockchain",
      style: "home",
      script: "home",
      transactions: transactions,
      blocks: blocks,
    });
  });

  router.use("/node", nodeRoute());
  router.use("/transaction", transactionRoute());
  router.use("/block", blockRoute());
  router.use("/blockchain", blockchainRoute());
  router.use("/user", userRoute());

  return router;
};
