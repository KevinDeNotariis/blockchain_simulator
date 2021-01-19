const isReachable = require("is-reachable");

const mongoose = require("mongoose");

const Block = mongoose.model("Block");
const Transaction = mongoose.model("Transaction");
const Peer = mongoose.model("Peer");

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

const get_transactions = async () => {
  return new Promise(async (done) => {
    const transactions = await Transaction.find({});
    done(transactions);
  });
};

module.exports = { get_blockchain, get_transactions, get_peers };
