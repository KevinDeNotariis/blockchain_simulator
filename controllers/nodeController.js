const http = require("http");
const qs = require("qs");
const mongoose = require("mongoose");

const { propagate_to_peers } = require("../utilities/functions");

const Node = mongoose.model("Node");
const Transaction = mongoose.model("Transaction");
const Peer = mongoose.model("Peer");

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
      txs_pool.push(txs[i]);
      counter += 1;
    }

    req.body.transactions = txs_pool;
    next();
  });
};

const propagate_block = async (req, res) => {
  console.log(
    "\n\nINSIDE propagate_block ATTEMPTING TO PROPAGATE THE RECEIVED BLOCK TO OTHER PEERS"
  );

  console.log("  - block we are trying to propagate: ");
  console.log(req.body);
  let post_data = qs.stringify(JSON.parse(JSON.stringify(req.body)));

  let peers = await Peer.find({});
  if (peers.length === 0)
    return res.status(400).json({ message: "No peers found" });

  let return_str = propagate_to_peers(
    peers,
    post_data,
    "/node/accept_block",
    "POST"
  );

  console.log("  - block propagated");

  return res.status(200).send(return_str);
};

const get_peers = async (req, res) => {
  const peers = await Peer.find({});

  return res.status(200).json(peers);
};

const fetchPeer = async (peer) => {
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
    const fetched_peers = JSON.parse(await fetchPeer(peers[i]));
    for (j in fetched_peers) {
      let peer = await Peer.findOne({
        address: fetched_peers[j].address,
        port: fetched_peers[j].port,
      });
      if (peer || fetched_peers[j].port === req.app.locals.port) {
        console.log("Peer already in DB");
        continue;
      }
      console.log("Adding new peer:");
      console.log(fetched_peers[j]);
      const new_peer = new Peer({
        address: fetched_peers[j].address,
        port: fetched_peers[j].port,
        status: fetched_peers[j].status,
        type: fetched_peers[j].type,
      });
      await new_peer.save();
      peers_from_peer.push(new_peer);
    }
  }
  return res.status(200).json(peers_from_peer);
};

module.exports = {
  add_node,
  create_txs_pool,
  propagate_block,
  get_peers,
  discover_peers,
};
