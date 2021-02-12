const express = require("express");
const router = express.Router();

const transactionController = require("../../../controllers/transactionController");

module.exports = () => {
  router.get(
    "/complete",
    transactionController.complete_validation,
    (req, res) => {
      return res.status(200).json({
        transaction: req.body.transaction,
        message: "Transaction valid",
      });
    }
  );

  router.get(
    "/partial",
    transactionController.partial_validation,
    (req, res) => {
      return res.status(200).json({
        transactions: req.body.transaction,
        message: "Transaction valid",
      });
    }
  );

  return router;
};
