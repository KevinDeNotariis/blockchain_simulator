const http = require("http");
const qs = require("qs");
const mongoose = require("mongoose");
const isReachable = require("is-reachable");

const Node = mongoose.model("Node");
const Transaction = mongoose.model("Transaction");
const Peer = mongoose.model("Peer");

const functions = require("../utilities/functions");
const dbManagement = require("../utilities/dbManagement");

const clear_db = (req, res) => {
  dbManagement.clear_dbs();
};

const add_node = (req, res) => {
  const newNode = new Node({
    address: `http://localhost:${req.body.port}`,
  });
  newNode.save((err, node) => {
    if (err) {
      return res.status(401).json({ message: err });
    } else {
      return res.status(200).json(node);
    }
  });
};

// ------ create_txs_pool ------------
/*
    This middleware allows a user to create
    a pool of transactions to incorporate in
    the block they will try to mine. 
*/

const create_txs_pool = (req, res, next) => {
  Transaction.find((err, txs) => {
    if (err) return res.status(401).json({ message: err });

    let txs_pool = [];
    let counter = 0;
    for (i in txs) {
      if (counter >= process.env.MAX_TXS_IN_BLOCK) {
        break;
      }
      if (txs[i].verify()) {
        txs_pool.push(txs[i]);
        counter += 1;
      }
    }

    req.body.transactions = txs_pool;
    next();
  });
};

const propagate_block = async (req, res) => {
  console.log(
    "\n\nINSIDE propagate_block ATTEMPTING TO PROPAGATE THE BLOCK TO OTHER PEERS"
  );

  console.log("  - block we are trying to propagate: ");
  console.log(req.body);
  let post_data = qs.stringify(JSON.parse(JSON.stringify(req.body)));

  let return_str = await functions.propagate_to_peers(
    post_data,
    "/node/accept_block",
    "POST"
  );

  console.log(return_str);

  return res.status(200).send(return_str);
};

const get_peers = async (req, res) => {
  const peers = await Peer.find({});

  return res.status(200).json(peers);
};

const fetch_peer = async (peer) => {
  return new Promise((resolve) => {
    let ret = "";
    const options = {
      host: peer.address,
      port: peer.port,
      path: "/node/get_peers",
      method: "GET",
    };
    const request = http.request(options, (response) => {
      response.on("data", (chunk) => {
        ret += chunk.toString("utf-8");
      });
      response.on("end", () => {
        resolve(ret);
      });
    });
    request.end();
  });
};

const discover_peers = async (req, res) => {
  const peers = await Peer.find({});
  const peers_from_peer = [];

  for (i in peers) {
    const fetched_peers = JSON.parse(await fetch_peer(peers[i]));
    for (j in fetched_peers) {
      let peer = await Peer.findOne({
        address: fetched_peers[j].address,
        port: fetched_peers[j].port,
      });
      if (peer || fetched_peers[j].port === req.app.locals.config.port) {
        console.log("Peer already in DB");
        continue;
      }
      console.log("Adding new peer:");
      console.log(fetched_peers[j]);
      let new_peer = new Peer({
        address: fetched_peers[j].address,
        port: fetched_peers[j].port,
        type: fetched_peers[j].type,
      });
      new_peer.status ===
      (await isReachable(`${new_peer.address}:${new_peer.port}`))
        ? true
        : false;
      await new_peer.save();
      peers_from_peer.push(new_peer);
    }
  }
  return res.status(200).json(peers_from_peer);
};

module.exports = {
  clear_db,
  add_node,
  create_txs_pool,
  propagate_block,
  get_peers,
  discover_peers,
};
