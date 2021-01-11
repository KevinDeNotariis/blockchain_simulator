const express = require("express");

const {
  add_transaction,
  validate_transaction,
  add_bunch_of_transactions,
} = require("../../controllers/transactionController");

const router = express.Router();

module.exports = () => {
  router.post("/add_bunch_of_transactions", add_bunch_of_transactions);

  router.post("/add_transaction", add_transaction);
  router.get("/validate_transaction", validate_transaction);

  return router;
};
