const express = require("express");

const userController = require("../../controllers/userController");

const transactionController = require("../../controllers/transactionController");

const { get_users } = require("../../utilities/dbManagement");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const users = await get_users();

    return res.render("index", {
      title: "Users",
      page: "user/index",
      styles: ["user"],
      script: "user",
      users: users,
    });
  });

  router.post("/add_bunch_of_users", userController.add_bunch_of_users);

  router.get("/generate_keys", userController.generate_keys);

  router.post(
    "/generate_transaction",
    userController.generate_transaction,
    transactionController.save_transaction,
    transactionController.propagate_transaction
  );

  router.get("/get_balance", userController.get_balance);

  return router;
};
