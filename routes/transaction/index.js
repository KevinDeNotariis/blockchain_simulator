const express = require("express");

const transactionController = require("../../controllers/transactionController");

const dbManagement = require("../../utilities/dbManagement");

const userController = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const transactions_validated = await dbManagement.get_all_transactions();

    return res.render("index", {
      title: "Transactions",
      page: "transaction/index",
      styles: ["transaction", "buttons", "table"],
      script: "transaction",
      transactions_validated: transactions_validated,
    });
  });

  router.get("/:transactionId", async (req, res) => {
    const transaction_info = await dbManagement.get_transaction_by_id_info(
      req.params.transactionId
    );
    return res.render("index", {
      title: "Transaction Info",
      page: "transaction/info",
      styles: ["transaction_info"],
      transaction_info: transaction_info,
    });
  });

  return router;
};
