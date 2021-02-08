const express = require("express");

const transactionController = require("../../../controllers/transactionController");

const userController = require("../../../controllers/userController");

const router = express.Router();

module.exports = () => {
  router.get("/", transactionController.get_transactions_pool);

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
    transactionController.propagate_transaction
  );

  router.put(
    "/no_propagation",
    transactionController.validate_transaction,
    transactionController.save_transaction,
    (req, res) => {
      return res.status(200).json({ message: "Transaction saved" });
    }
  );

  router.post("/bunch_of", transactionController.add_bunch_of_transactions);

  router.get("/from_peer", transactionController.get_transactions_from_peer);

  router.get(
    "/from_all_peers",
    transactionController.get_transactions_from_all_peers
  );

  router.get(
    "/validate",
    transactionController.validate_transaction,
    (req, res) => {
      return res.status(200).json({
        transaction: req.body.transaction,
        message: "Transaction valid",
      });
    }
  );
  return router;
};
