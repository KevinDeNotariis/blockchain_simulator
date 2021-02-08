const express = require("express");

const router = express.Router();

const setUpController = require("../../../controllers/setUpController");

const blockchainController = require("../../../controllers/blockchainController");

module.exports = () => {
  router.get(
    "/",
    setUpController.check,
    setUpController.clear_dbs,
    blockchainController.add_genesis_block,
    setUpController.generate_users,
    setUpController.generate_transactions,
    setUpController.mine_first_blocks,
    setUpController.add_peers,
    setUpController.send_to_peers
  );

  router.post("/clear_db", setUpController.clear_db);
  router.post("/add_users", setUpController.add_users);
  router.post("/add_transactions", setUpController.add_transactions);
  router.post("/add_blocks", setUpController.add_blocks);
  router.post("/add_hashes", setUpController.add_hashes);
  router.post("/add_peers", setUpController.add_peers, (req, res) => {
    req.app.locals.config.setup = true;
    return res.status(200).json({ message: "Peers added" });
  });

  return router;
};
