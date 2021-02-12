const express = require("express");

const transactionController = require("../../../controllers/transactionController");

const userController = require("../../../controllers/userController");

const router = express.Router();

const validationRoute = require("./validation");

module.exports = () => {
  router.get("/", transactionController.get_transactions_pool);

  router.put(
    "/",
    transactionController.complete_validation,
    transactionController.save_transaction,
    transactionController.propagate_transaction
  );

  router.post(
    "/",
    userController.generate_transaction,
    transactionController.complete_validation,
    transactionController.save_transaction,
    transactionController.propagate_transaction
  );

  router.put(
    "/no_propagation",
    transactionController.complete_validation,
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

  router.use("/validation", validationRoute());

  return router;
};
