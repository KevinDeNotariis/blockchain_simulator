const http = require("http");
const qs = require("qs");
const mongoose = require("mongoose");

const Node = mongoose.model("Node");
const Transaction = mongoose.model("Transaction");
const Block = mongoose.model("Block");

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

//----------- create_block -----------------
/*
    Once the user has created the transactions pool,
    it creates the block, by looking at the blockchain
    and retrieving the last block, since they need
    to incorporate the new block id and the previous_hash
    in the block they are trying to mine
*/

const propagate_block = (req, res) => {
  console.log(
    "INSIDE propagate_block ATTEMPTING TO PROPAGATE THE RECEIVED BLOCK TO OTHER PEERS"
  );

  console.log("  - block we are trying to propagate: ");
  console.log(req.body);
  let post_data = qs.stringify(JSON.parse(JSON.stringify(req.body)));

  const options = {
    host: "localhost",
    path: "/node/accept_block",
    port: "3001",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(post_data),
    },
  };

  let str = "";

  const request = http.request(options, (response) => {
    response.on("data", (chunk) => {
      str += chunk.toString("utf-8");
    });
    response.on("end", () => {
      return res.status(200).json(JSON.parse(str));
    });
  });

  request.write(post_data);
  request.end();
};

module.exports = {
  add_node,
  create_txs_pool,
  propagate_block,
};
