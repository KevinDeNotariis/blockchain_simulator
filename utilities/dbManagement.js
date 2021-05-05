const isReachable = require("is-reachable");

const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const Block = require("../models/blockModel");
const Peer = require("../models/peerModel");
const Hash = require("../models/hashModel");

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

    peers.map(async (peer) => {
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

const get_max_id = async () => {
  return new Promise(async (done) => {
    const blocks = await Hash.find({});
    done(blocks.map((elem) => elem.block_id).reduce((a, b) => Math.max(a, b)));
  });
};

const get_previous_hash = async () => {
  return new Promise(async (done) => {
    const max_id = await get_max_id();
    done((await Hash.findOne({ block_id: max_id })).block_hash);
  });
};

const get_transaction_by_id = async (transactionId) => {
  return new Promise(async (done) => {
    const block = await Block.findOne({ "transactions.id": transactionId });
    if (block) {
      const tx = block.transactions.find((tx) => (tx.id = transactionId));
      tx.validate = true;
      done(tx);
    }
    const tx = await Transaction.findOne({ id: transactionId });
    if (tx) {
      tx.validated = false;
      done(tx);
    }
    done({});
  });
};

const get_transaction_by_id_info = async (transactionId) => {
  return new Promise(async (done) => {
    const block = await Block.findOne({ "transactions.id": transactionId });
    if (block) {
      const tx = block.transactions.find((tx) => (tx.id = transactionId));
      const tx_info = {
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        id: tx.id,
        timestamp: tx.timestamp,
        blockId: block.header.id,
        validated: false,
      };
      done(tx_info);
    }
    let tx = await Transaction.findOne({ id: transactionId });
    if (tx) {
      tx = tx.toObject();
      delete tx.signature;
      tx.validate = false;
      done(tx);
    }
  });
};

module.exports = {
  clear_db,
  get_blockchain,
  get_transactions_in_pool,
  get_all_transactions,
  get_peers,
  get_users,
  get_max_id,
  get_previous_hash,
  get_transaction_by_id,
  get_transaction_by_id_info,
};
