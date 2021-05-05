const express = require("express");

const userController = require("../../controllers/userController");

const dbManagement = require("../../utilities/dbManagement");
const config = require("../../config");

const router = express.Router();

module.exports = () => {
  router.get("/", async (req, res) => {
    const users = await dbManagement.get_users();

    return res.render("index", {
      title: "Users",
      page: "user/index",
      styles: ["user"],
      script: "user",
      users: users,
    });
  });

  router.get("/:public_key", userController.get_user_by_id, (req, res) => {
    if (req.params.public_key !== config.config.coinbase.public) {
      const user_info = req.body.user_info;
      return res.render("index", {
        title: "User Info",
        page: "user/info",
        styles: ["user_info"],
        user_info: user_info,
      });
    } else {
      const coinbase_info = {
        public_key: config.config.coinbase.public,
      };
      return res.render("index", {
        title: "Coinbase",
        page: "user/coinbase",
        styles: ["coinbase"],
        coinbase_info: coinbase_info,
      });
    }
  });

  return router;
};
