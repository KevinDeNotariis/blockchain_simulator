const http = require("http");
const isReachable = require("is-reachable");
const qs = require("qs");

const mongoose = require("mongoose");

const Peer = mongoose.model("Peer");
const Block = mongoose.model("Block");
const Transaction = mongoose.model("Transaction");

const propagate_to_peers = async (_post_data, api, method) => {
  return new Promise(async (done) => {
    const peers = await check_peers_availability();
    const post_data = qs.stringify(JSON.parse(JSON.stringify(_post_data)));
    if (peers === undefined || peers.length === 0) {
      return "No peers available";
    }
    let return_str = "";
    let counter = 0;
    for (i in peers) {
      if (!peers[i].status) {
        return_str += `Peer: ${peers[i].address}:${peers[i].port} not available\n`;
        continue;
      }
      counter += 1;
      const options = {
        host: peers[i].address,
        port: peers[i].port,
        path: api,
        method: method,
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
          counter -= 1;
          if (counter === 0) done(return_str);
        });
      });
      request.write(post_data);
      return_str += `Peer: ${peers[i].address}:${peers[i].port} has been contacted through the API: ${api}\n`;
      request.end();
    }
  });
};

const save_transactions_from_single_peer = async ({
  address,
  port,
  type,
  status,
}) => {
  return new Promise(async (done) => {
    if (await isReachable(`${address}:${port}`)) {
      const peer = new Peer({
        address: address,
        port: port,
        type: type,
        status: true,
      });
      const fetched_transactions = JSON.parse(await fetch_transactions(peer));
      for (let i in fetched_transactions) {
        const transaction = await Transaction.findOne({
          id: fetched_transactions[i].id,
          hash: fetched_transactions[i].hash,
        });
        if (!transaction) {
          const new_transaction = new Transaction(fetched_transactions[i]);
          if (new_transaction.verify()) {
            await new_transaction.save();
            console.log("  Transaction added");
          } else {
            console.log("  Transaction is invalid");
          }
        } else {
          console.log("  Transaction Already in DB");
        }
      }
    } else {
      done(false);
    }
    done(true);
  });
};

const fetch_transactions = async ({ address, port }) => {
  return new Promise((resolve) => {
    let ret = "";
    const options = {
      host: address,
      port: port,
      path: "/transaction/get_transactions",
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

const fetch_blocks = async (address, port, id) => {
  return new Promise((resolve) => {
    const data = { id: id };
    let ret = "";
    const options = {
      host: address,
      port: port,
      path: "/block/get_blocks_from_id",
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
    request.write(data);
    request.end();
  });
};

const save_blocks_from_single_peer = async (address, port, id, max_id) => {
  return new Promise(async (done) => {
    if (await isReachable(`${address}:${port}`)) {
      const blocks = JSON.parse(await fetch_blocks(address, port, id));
      if (blocks.length === 0) return false;

      for (let i in blocks) {
        const block = new Block(blocks[i]);
        //check if block is valid

        //add to block array
      }
    }
    //return the block array
  });
};

const check_peers_availability = async () => {
  const peers = await Peer.find({});
  if (peers.length !== 0) {
    peers.map(async (peer) => {
      if (await isReachable(`${peer.address}:${peer.port}`)) {
        peer.status = true;
      } else {
        peer.status = false;
      }
      await Peer.updateOne(
        { address: peer.address, port: peer.port },
        { $set: { status: peer.status } }
      );
    });
  }
  return peers;
};

module.exports = {
  propagate_to_peers,
  save_transactions_from_single_peer,
  save_blocks_from_single_peer,
};
