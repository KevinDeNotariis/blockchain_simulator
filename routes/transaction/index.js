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

  return router;
};
