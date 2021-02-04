const http = require("http");
const isReachable = require("is-reachable");
const qs = require("qs");

const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

const mongoose = require("mongoose");

const Peer = mongoose.model("Peer");
const Block = mongoose.model("Block");
const Transaction = mongoose.model("Transaction");

/**
 * @typedef {Object} PeerRes
 * @property {Peer} peer
 * @property {Object} res - Response from the peer
 */

/**
 * @typedef {Object} PropagateReturn
 * @property {String[]} contacted - String informing that the peer has been contacted
 * @property {PeerRes[]} peers_res
 */

/**
 * Allows to propagate the given data to peers in the network
 * @param {Object} _post_data - The data needs to be propagated to peers
 * @param {String} api  - The API through which the peers need to be contacted
 * @param {String} method - The method, i.e. GET, POST, PUT, etc..
 * @returns {PropagateReturn}
 */
const propagate_to_peers = async (_post_data, api, method) => {
  return new Promise(async (done) => {
    const peers = await check_peers_availability();
    const post_data = qs.stringify(JSON.parse(JSON.stringify(_post_data)));
    if (peers === undefined || peers.length === 0) {
      done("No peers available");
    }
    let return_obj = {
      contacted: [],
      peers_res: [],
    };
    let counter = peers.length;
    for (i in peers) {
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

      let peer_res = "";

      const request = http.request(options, (response) => {
        response.on("data", (chunk) => {
          peer_res += chunk.toString("utf-8");
        });
        response.on("end", () => {
          counter -= 1;
          return_obj.peers_res.push({
            peer: peers[i],
            res: JSON.parse(peer_res),
          });
          if (counter === 0) done(return_obj);
        });
      });
      request.write(post_data);
      return_obj.contacted.push(
        `Peer: ${peers[i].address}:${peers[i].port} has been contacted through the API: ${api}\n`
      );
      request.end();
    }
  });
};

const save_transactions_from_single_peer = async ({ address, port }) => {
  return new Promise(async (done) => {
    if (await isReachable(`${address}:${port}`)) {
      const fetched_transactions = JSON.parse(
        await fetch_transactions(address, port)
      );
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

const fetch_transactions = async (address, port) => {
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
  let ret = [];
  if (peers.length !== 0) {
    peers.map(async (peer) => {
      if (await isReachable(`${peer.address}:${peer.port}`)) {
        peer.status = true;
        ret.push(peer);
      } else {
        peer.status = false;
      }
      await Peer.updateOne(
        { address: peer.address, port: peer.port },
        { $set: { status: peer.status } }
      );
    });
  }
  return ret;
};

const get_money_spent_by_user_validated = async (user_pub_key) => {
  return new Promise(async (done) => {
    const as_sender_blocks = await Block.find({
      "transactions.sender": user_pub_key,
    });

    let spent = 0;

    if (as_sender_blocks.length === 0) {
      console.log("This user did not spend any money");
    } else {
      let spent_txs = [];
      await as_sender_blocks.map((block) => {
        block.transactions.map((tx) => {
          if (tx.sender === user_pub_key) spent_txs.push(tx);
        });
      });
      spent = await spent_txs
        .map((elem) => elem.amount)
        .reduce((a, b) => a + b);
    }
    done(spent);
  });
};

const get_money_gained_by_user_validated = async (user_pub_key) => {
  return new Promise(async (done) => {
    const as_receiver_blocks = await Block.find({
      "transactions.receiver": user_pub_key,
    });

    let gained = 0;

    if (as_receiver_blocks.length === 0) {
      console.log("This user did not spend any money");
    } else {
      let received_txs = [];
      await as_receiver_blocks.map((block) => {
        block.transactions.map((tx) => {
          if (tx.receiver === user_pub_key) received_txs.push(tx);
        });
      });
      gained = await received_txs
        .map((elem) => elem.amount)
        .reduce((a, b) => a + b);
    }
    done(gained);
  });
};

const get_balance_from_user_validated = async (user_pub_key) => {
  return new Promise(async (done) => {
    const spent = await get_money_spent_by_user_validated(user_pub_key);
    const gained = await get_money_gained_by_user_validated(user_pub_key);
    done({
      spent: spent,
      gained: gained,
    });
  });
};

const get_money_spent_by_user_in_pool = async (user_pub_key, timestamp) => {
  return new Promise(async (done) => {
    let sent;
    if (timestamp) {
      sent = await Transaction.find({
        sender: user_pub_key,
        timestamp: { $lt: timestamp },
      });
    } else {
      sent = await Transaction.find({ sender: user_pub_key });
    }
    let spent = 0;

    if (sent.length === 0) {
      console.log("This user did not spend any money in pool");
    } else {
      spent = await sent.map((elem) => elem.amount).reduce((a, b) => a + b);
    }
    done(spent);
  });
};

const get_money_gained_by_user_in_pool = async (user_pub_key, timestamp) => {
  return new Promise(async (done) => {
    let received;
    if (timestamp) {
      received = await Transaction.find({
        receiver: user_pub_key,
        timestamp: { $lt: timestamp },
      });
    } else {
      received = await Transaction.find({ receiver: user_pub_key });
    }

    let gained = 0;

    if (received.length === 0) {
      console.log("This user did not receive any money in pool");
    } else {
      gained = await received
        .map((elem) => elem.amount)
        .reduce((a, b) => a + b);
    }
    done(gained);
  });
};

const get_balance_from_user_in_pool = async (user_pub_key, timestamp) => {
  return new Promise(async (done) => {
    const spent = await get_money_spent_by_user_in_pool(
      user_pub_key,
      timestamp
    );
    const gained = await get_money_gained_by_user_in_pool(
      user_pub_key,
      timestamp
    );
    done({
      spent: spent,
      gained: gained,
    });
  });
};

const verify_keys = async (public_key, private_key) => {
  return ec.keyFromSecret(private_key).getPublic("hex") === public_key;
};

module.exports = {
  propagate_to_peers,
  save_transactions_from_single_peer,
  save_blocks_from_single_peer,
  get_balance_from_user_validated,
  get_money_gained_by_user_in_pool,
  get_money_spent_by_user_in_pool,
  get_balance_from_user_in_pool,
  verify_keys,
};
