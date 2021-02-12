const express = require("express");

const router = express.Router();

const peerController = require("../../../controllers/peerController");

module.exports = () => {
  router.get("/", peerController.get_peers);

  router.put("/", peerController.add_peer);

  router.delete("/", peerController.delete_peer);

  router.put("/discover", peerController.discover_peers);

  return router;
};
