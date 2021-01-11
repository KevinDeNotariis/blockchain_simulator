const express = require("express");

const {
  generate_keys,
  add_bunch_of_users,
} = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
  router.post("/add_bunch_of_users", add_bunch_of_users);

  router.get("/generate_keys", generate_keys);

  return router;
};
