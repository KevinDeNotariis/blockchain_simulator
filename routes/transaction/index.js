const express = require("express");

const {
  save_transaction,
  validate_transaction,
  add_bunch_of_transactions,
  propagate_transaction,
  get_transactions,
  get_transactions_from_peer,
  get_transactions_from_all_peers,
} = require("../../controllers/transactionController");

const { generate_transaction } = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
  router.post("/add_bunch_of_transactions", add_bunch_of_transactions);

  router.post(
    "/accept_transaction",
    validate_transaction,
    save_transaction,
    propagate_transaction
  );

  router.post(
    "/add_transaction",
    generate_transaction,
    save_transaction,
    (req, res) => {
      return res.status(200).json(req.body);
    }
  );

  router.get("/get_transactions", get_transactions);

  router.get("/get_transactions_from_peer", get_transactions_from_peer);

  router.get(
    "/get_transactions_from_all_peers",
    get_transactions_from_all_peers
  );

  return router;
};
