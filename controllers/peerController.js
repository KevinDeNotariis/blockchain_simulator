const mongoose = require("mongoose");
const Peer = mongoose.model("Peer");

const isReachable = require("is-reachable");

const functions = require("../utilities/functions");

const add_peer = async (req, res) => {
  const received_peer = req.body.peer;
  //Search in the database if the received peer is already there
  const peer = await Peer.findOne({
    address: received_peer.address,
    port: received_peer.port,
  });
  //If the peer is not there add it to the DB
  if (!peer) {
    const peer_db = new Peer({
      address: received_peer.address,
      port: received_peer.port,
      status: (await isReachable(
        `${received_peer.address}:${received_peer.port}`
      ))
        ? true
        : false,
      type: received_peer.type,
    });

    await peer_db.save();
    return res.status(200).json({ message: "Peer added", peer: received_peer });
  } else {
    return res
      .status(400)
      .json({ message: "Peer already in DB", peer: received_peer });
  }
};

const delete_peer = async (req, res) => {
  const received_peer = req.body.peer;

  const del_peer = await Peer.findOne({
    address: received_peer.address,
    port: received_peer.port,
  });
  if (del_peer) {
    await Peer.deleteOne(del_peer);
    return res
      .status(200)
      .json({ message: "Peer deleted", peer: received_peer });
  } else {
    return res
      .status(400)
      .json({ message: "Peer not in DB", peer: received_peer });
  }
};

const get_peers = async (req, res) => {
  const peers = await Peer.find({});

  return res
    .status(200)
    .json({ message: "Peers fetched from DB", peers: peers });
};

const discover_peers = async (req, res) => {
  // Check for available peers and save them
  const peers = await functions.check_peers_availability();
  const peers_from_peer = [];

  // For each available peer, fetch the peers of that peer
  for (i in peers) {
    const fetched_peers = JSON.parse(
      await functions.fetch_from_peer(peers[i], "/api/peer")
    ).peers;
    // For each peer fetched from the available peer, we check if the current
    // node has already that peer, if not, we had it to the DB
    for (j in fetched_peers) {
      let peer = await Peer.findOne({
        address: fetched_peers[j].address,
        port: fetched_peers[j].port,
      });
      if (
        peer ||
        (fetched_peers[j].port === req.app.locals.config.port &&
          fetched_peers[j].address === req.app.locals.config.address)
      ) {
        console.log("Peer already in DB");
        continue;
      }
      let new_peer = new Peer({
        address: fetched_peers[j].address,
        port: fetched_peers[j].port,
        type: fetched_peers[j].type,
        status: (await isReachable(
          `${fetched_peers[j].address}:${fetched_peers[j].port}`
        ))
          ? true
          : false,
      });
      console.log(`Adding new peer '${new_peer.address}:${new_peer.port}`);
      await new_peer.save();
      peers_from_peer.push({
        address: new_peer.address,
        port: new_peer.port,
        type: new_peer.type,
      });
    }
  }
  return res.status(200).json({
    message:
      peers_from_peer.length === 0 ? "No peers discovered" : "Peers discovered",
    peers: peers_from_peer,
  });
};

module.exports = {
  add_peer,
  delete_peer,
  discover_peers,
  get_peers,
};
