const isReachable = require("is-reachable");

const mongoose = require("mongoose");

const Block = mongoose.model("Block");
const Transaction = mongoose.model("Transaction");
const Peer = mongoose.model("Peer");
const User = mongoose.model("User");
const Hash = mongoose.model("Hash");

const clear_db = async () => {
  await Block.deleteMany({});
  console.log("Blocks cleared");
  await Transaction.deleteMany({});
  console.log("Transactions cleared");
  await Peer.deleteMany({});
  console.log("Peers cleared");
  await User.deleteMany({});
  console.log("Users cleared");
  await Hash.deleteMany({});
  console.log("Hashes cleared");
};

const get_peers = async () => {
  return new Promise(async (done) => {
    const peers = await Peer.find({});

    await peers.map(async (peer) => {
      peer.status = await isReachable(`${peer.address}:${peer.port}`);

      await Peer.updateOne(
        { address: peer.address, port: peer.port },
        { $set: { status: peer.status } }
      );
    });

    done(peers);
  });
};

const get_blockchain = async () => {
  return new Promise(async (done) => {
    const blocks = await Block.find({});
    done(blocks);
  });
};

const get_all_transactions = async () => {
  return new Promise(async (done) => {
    let transactions = [];
    await (await Block.find({})).map((block) => {
      transactions.push(...block.transactions);
    });
    done(transactions);
  });
};

const get_transactions_in_pool = async () => {
  return new Promise(async (done) => {
    const transactions = await Transaction.find({});
    done(transactions);
  });
};

const get_users = async () => {
  return new Promise(async (done) => {
    const users = await User.find({});
    done(users);
  });
};

module.exports = {
  clear_db,
  get_blockchain,
  get_transactions_in_pool,
  get_all_transactions,
  get_peers,
  get_users,
};
