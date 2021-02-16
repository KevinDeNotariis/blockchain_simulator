const express = require("express");

const nodeRoute = require("./node");
const transactionRoute = require("./transaction");
const blockRoute = require("./block");
const userRoute = require("./user");
const peerRoute = require("./peer");

const setUpRoute = require("./set_up");

const router = express.Router();

module.exports = () => {
  router.use("/", (req, res, next) => {
    console.log(
      `Received following request (${req.app.locals.config.address}: ${req.app.locals.config.port}): `
    );
    console.log(
      "   " +
        req.method +
        " : " +
        (req.connection.remoteAddress.startsWith("::")
          ? req.connection.remoteAddress.startsWith("::1")
            ? "127.0.0.1"
            : req.connection.remoteAddress.substr(7)
          : req.connection.remoteAddress) +
        "   --->   " +
        req.originalUrl +
        " "
    );
    return next();
  });

  router.use("/node", nodeRoute());
  router.use("/transaction", transactionRoute());
  router.use("/block", blockRoute());
  router.use("/user", userRoute());
  router.use("/peer", peerRoute());
  router.use("/set_up", setUpRoute());

  return router;
};
