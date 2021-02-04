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

  router.put(
    "/",
    transactionController.validate_transaction,
    transactionController.save_transaction,
    transactionController.propagate_transaction
  );

  router.post(
    "/",
    userController.generate_transaction,
    transactionController.validate_transaction,
    transactionController.save_transaction,
    (req, res) => {
      return res.status(200).json({
        message: "Transaction added",
        transaction: req.body.transaction,
      });
    }
  );

  router.post(
    "/add_bunch_of_transactions",
    transactionController.add_bunch_of_transactions
  );

  router.get("/get_transactions", transactionController.get_transactions);

  router.get(
    "/get_transactions_from_peer",
    transactionController.get_transactions_from_peer
  );

  router.get(
    "/get_transactions_from_all_peers",
    transactionController.get_transactions_from_all_peers
  );

  router.get(
    "/validate_transaction",
    transactionController.validate_transaction,
    (req, res) => {
      return res.status(200).json({ message: "Transaction Valid" });
    }
  );

  return router;
};
