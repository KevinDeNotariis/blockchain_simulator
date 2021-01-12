const express = require("express");

const {
  save_transaction,
  validate_transaction,
  add_bunch_of_transactions,
  propagate_transaction,
  get_transactions,
} = require("../../controllers/transactionController");

const router = express.Router();

module.exports = () => {
  router.post("/add_bunch_of_transactions", add_bunch_of_transactions);

  router.post(
    "/accept_transaction",
    validate_transaction,
    save_transaction,
    propagate_transaction
  );

  router.get("/get_transactions", get_transactions);

  return router;
};
