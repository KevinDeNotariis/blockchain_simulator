const express = require("express");

const {
  generate_keys,
  add_bunch_of_users,
  generate_transaction,
} = require("../../controllers/userController");

const {
  propagate_transaction,
  save_transaction,
} = require("../../controllers/transactionController");

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

  router.post("/add_bunch_of_users", add_bunch_of_users);

  router.get("/generate_keys", generate_keys);

  router.post(
    "/generate_transaction",
    generate_transaction,
    save_transaction,
    propagate_transaction
  );

  return router;
};
