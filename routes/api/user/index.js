const express = require("express");

const userController = require("../../../controllers/userController");

const transactionController = require("../../../controllers/transactionController");

const router = express.Router();

module.exports = () => {
  router.post("/bunch_of", userController.add_bunch_of_users);

  router.get("/generate_keys", userController.generate_keys);

  router.get("/balance", userController.get_balance);

  return router;
};
