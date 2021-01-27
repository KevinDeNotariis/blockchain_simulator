const express = require("express");

const nodeRoute = require("./node");
const transactionRoute = require("./transaction");
const blockRoute = require("./block");
const blockchainRoute = require("./blockchain");
const userRoute = require("./user");
const peerRoute = require("./peer");

const setUpRoute = require("./set_up");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    return res.render("index", {
      title: `Peer at localhost:${req.app.locals.config.port}`,
      page: "index",
      styles: ["home", "buttons"],
      script: "home",
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
