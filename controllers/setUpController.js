const http = require("http");
const mongoose = require("mongoose");
const qs = require("qs");

const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");
const Block = mongoose.model("Block");
const Peer = mongoose.model("Peer");
const Hash = mongoose.model("Hash");

const dbManagement = require("../utilities/dbManagement");
const functions = require("../utilities/functions");
const configuration = require("../config");

const TransactionClass = require("../classes/Transaction");
const BlockClass = require("../classes/Block");

const isReachable = require("is-reachable");

const check = (req, res, next) => {
  if (req.app.locals.config.setup)
    return res.status(200).json({ message: "Already set up" });

  next();
};

const clear_dbs = async (req, res, next) => {
  console.log("Clearing database");
  await dbManagement.clear_db();
  next();
};

const generate_users = (req, res, next) => {
  const data = qs.stringify(
    JSON.parse(
      JSON.stringify({
        num_users: configuration.config.setUp.users_num,
      })
    )
  );
  const options = {
    host: req.app.locals.config.address,
    port: req.app.locals.config.port,
    path: "/api/user/bunch_of",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(data),
    },
  };
  let ret = "";
  const request = http.request(options, (response) => {
    response.on("data", (chunk) => {
      ret += chunk.toString("utf-8");
    });
    response.on("end", () => {
      console.log(JSON.parse(ret).message);
      next();
    });
  });
  request.write(data);
  request.end();
};

const generate_transactions = async (req, res, next) => {
  const initial_sum =
    configuration.config.setUp.initial_money /
    configuration.config.peers.length;

  let txs = [];

  // create the first transactions from COINBASE
  for (let i in configuration.config.peers) {
    const tx = new TransactionClass(
      configuration.config.coinbase.public,
      configuration.config.peers[i].public_key,
      initial_sum
    );
    tx.sign(configuration.config.coinbase.private);
    txs.push(tx);
  }

  // create a block with these transactions, creating effectively money
  // from nothing
  const block = new BlockClass();

  block.init(
    1,
    await dbManagement.get_previous_hash(),
    configuration.config.setUp.initial_difficulty,
    txs
  );

  // mine the block
  console.log(block.mine());

  // save the block in the database, with the hash and id
  const block_db = new Block(block);
  await block_db.save();

  const hash_db = new Hash({
    block_hash: block.hash(),
    block_id: block.header.id,
  });
  await hash_db.save();

  // create new transactions passing money from these peers
  // to other users created before
  const peers = configuration.config.peers;
  let new_txs_per_peer = Math.floor(
    configuration.config.setUp.transactions_num / peers.length
  );
  req.transactions = [];
  for (i in peers) {
    for (let j = 0; j < new_txs_per_peer; j++) {
      const user = await User.findOne({}, null, {
        skip: Math.floor(Math.random() * configuration.config.setUp.users_num),
      });
      const tx = new TransactionClass(
        peers[i].public_key,
        user.public_key,
        Math.floor(
          Math.random() * configuration.config.setUp.initial_amount_range
        )
      );
      tx.sign(peers[i].private_key);
      req.transactions.push(tx);
    }
  }
  next();
};

const mine_first_blocks = async (req, res, next) => {
  const txs = await req.transactions.map((elem) => new TransactionClass(elem));
  while (txs.length !== 0) {
    let current_txs = [];
    for (let i = 0; i < configuration.config.max_txs_in_block; i++) {
      current_txs.push(txs.pop());
      if (txs.length === 0) break;
    }
    const block = new BlockClass();
    console.log(current_txs.map((elem) => elem.hash()));
    block.init(
      (await dbManagement.get_max_id()) + 1,
      await dbManagement.get_previous_hash(),
      configuration.config.setUp.initial_difficulty,
      current_txs
    );
    console.log(block.mine());

    const block_db = new Block(block);
    await block_db.save();

    const hash_db = new Hash({
      block_hash: block.hash(),
      block_id: block.header.id,
    });
    await hash_db.save();
  }
  next();
};

const send_to_peers = async (req, res, next) => {
  const blocks = await Block.find({});
  const hashes = await Hash.find({});
  const users = await User.find({});
  let ret = {};
  ret.clear_db = await functions.propagate_to_peers_wait_res(
    " ",
    "/api/set_up/clear_db",
    "POST"
  );

  for (let i = 10; i < 101; i += 10) {
    ret.add_users = await functions.propagate_to_peers_wait_res(
      { users: users.slice(i - 10, i) },
      "/api/set_up/add_users",
      "POST"
    );
  }
  ret.add_blocks = await functions.propagate_to_peers_wait_res(
    { blocks: blocks },
    "/api/set_up/add_blocks",
    "POST"
  );

  ret.add_hashes = await functions.propagate_to_peers_wait_res(
    { hashes: hashes },
    "/api/set_up/add_hashes",
    "POST"
  );
  ret.add_peers = await functions.propagate_to_peers_wait_res(
    "",
    "/api/set_up/add_peers",
    "POST"
  );

  req.app.locals.config.setup = true;
  console.log(JSON.stringify(ret, null, 2));
  return res.status(200).json({ message: "Done", log: ret });
};

const clear_db = async (req, res) => {
  console.log("Clearing database");
  await dbManagement.clear_db();
  return res.status(200).json({ message: "Database cleared" });
};

const add_users = async (req, res) => {
  console.log("Adding users");
  await User.insertMany(req.body.users);
  return res.status(200).json({ message: "Users added" });
};

const add_transactions = async (req, res) => {
  console.log("Adding transactions");
  console.log(req.body.transactions);
  await Transaction.insertMany(req.body.transactions);
  return res.status(200).json({ message: "Transactions added" });
};

const add_blocks = async (req, res) => {
  console.log("Adding blocks");
  await Block.insertMany(req.body.blocks);
  return res.status(200).json({ message: "Blocks added" });
};

const add_hashes = async (req, res) => {
  console.log("Adding hashes");
  await Hash.insertMany(req.body.hashes);

  return res.status(200).json({ message: "Hashes added" });
};

const add_peers = async (req, res, next) => {
  console.log("Adding peers");
  configuration.config.peers.map(async (peer) => {
    if (peer.port !== req.app.locals.config.port) {
      const peer_db = new Peer({
        address: peer.address,
        port: peer.port,
        status: await isReachable(`${peer.address}:${peer.port}`),
        type: "undefined",
      });
      await peer_db.save();
    }
  });
  next();
};

module.exports = {
  check,
  clear_dbs,
  generate_users,
  generate_transactions,
  mine_first_blocks,
  send_to_peers,
  clear_db,
  add_blocks,
  add_peers,
  add_hashes,
  add_transactions,
  add_users,
};
