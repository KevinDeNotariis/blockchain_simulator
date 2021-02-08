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

  return router;
};
