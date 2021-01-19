const crypto = require("crypto");
const mongoose = require("mongoose");
const qs = require("qs");
const http = require("http");

const isReachable = require("is-reachable");

const {
  propagate_to_peers,
  save_transactions_from_single_peer,
} = require("../utilities/functions");

const Transaction = mongoose.model("Transaction");
const User = mongoose.model("User");
const Peer = mongoose.model("Peer");

const add_bunch_of_transactions = async (req, res) => {
  let transaction;
  let sender;
  let receiver;
  let doc_num;
  await User.find((err, u) => (doc_num = u.length));
  for (let i = 0; i < req.body.num_txs; i++) {
    await User.findOne(
      {},
      null,
      { skip: Math.floor(Math.random() * doc_num) },
      (err, user) => {
        sender = user.public_key;
      }
    );
    console.log(sender);
    await User.findOne(
      {},
      null,
      { skip: Math.floor(Math.random() * doc_num) },
      (err, user) => {
        receiver = user.public_key;
      }
    );
    console.log(receiver);
    transaction = new Transaction({
      id: crypto.randomBytes(32).toString("hex"),
      sender: sender,
      receiver: receiver,
      amount: Math.floor(Math.random() * 1000),
    });

    await User.findOne({ public_key: sender }, (err, user) => {
      if (err) return res.status(401).json({ message: err });
      if (!user) return res.status(400).message({ message: "User not found" });
      transaction.sign(user.private_key);
    });

    transaction.save((err, tx) => {
      if (err) return res.status(401).json({ message: err });

      console.log("Added the following transaction");
    });
  }
  return res.status(200).send("Transaction added");
};

const get_transactions = async (req, res) => {
  const transactions = await Transaction.find({});

  return res.status(200).json(transactions);
};

const save_transaction = async (req, res, next) => {
  console.log(
    "\n\nINSIDE save_transaction, ATTEMPTING TO SAVE THE TRANSACTION INTO DB"
  );
  const transaction = new Transaction({
    id: req.body.id,
    sender: req.body.sender,
    receiver: req.body.receiver,
    amount: req.body.amount,
    signature: req.body.signature,
    hash: req.body.hash,
  });

  await transaction.save();
  console.log("  - transaction saved successfully");

  next();
};

const validate_transaction = async (req, res, next) => {
  //Info printing
  console.log(
    "\n\nINSIDE validate_transaction, RECEIVED THE FOLLOWING TRANSACTION:"
  );
  console.log(req.body);
  console.log("  - validation of the transaction");
  console.log("  - checking whether this node has already the transaction");

  //First check whether the node has already the transaction
  let tx = await Transaction.findOne({
    id: req.body.id,
  });
  if (tx) {
    console.log("Already got that transaction");
    return res.status(400).json({ message: "Already got that transaction" });
  }
  console.log("  the node do not have the transaction.");

  const transaction = new Transaction({
    id: req.body.id,
    sender: req.body.sender,
    receiver: req.body.receiver,
    amount: req.body.amount,
    signature: req.body.signature,
    hash: req.body.hash,
  });

  console.log("  - checking the validity of the signature in the transaction");

  if (!transaction.verify())
    return res.status(400).json({ message: "Transaction not valid" });

  console.log("    signature valid.");
  console.log("exiting the function");

  req.body = transaction;

  next();
};

const propagate_transaction = async (req, res) => {
  console.log(
    "\n\nINSIDE propagate_transaction, ATTEMPTING TO SEND TRANSACTION TO PEERS"
  );

  console.log("  - searching for the peers");
  let peers = await Peer.find({});
  if (peers.length === 0) {
    return res.status(400).json({ message: "No peers found" });
  }

  console.log("  - found the following peers:");
  console.log(peers);

  console.log("  - sending transaction to the peers");

  const post_data = qs.stringify(JSON.parse(JSON.stringify(req.body)));

  const return_str = propagate_to_peers(
    peers,
    post_data,
    "/transaction/accept_transaction",
    "POST"
  );

  console.log("  - transaction sent.");

  return res.status(200).send(return_str);
};

const get_transactions_from_peer = async (req, res) => {
  if (await save_transactions_from_single_peer(req.body)) {
    return res.status(200).json({
      message: `Transactions fetched From Peer: ${req.body.address}:${req.body.port}`,
    });
  } else {
    return res.status(503).json({ message: "Peer not available" });
  }
};

const get_transactions_from_all_peers = async (req, res) => {
  const peers = await Peer.find({});

  if (peers.length === 0) {
    return res.status(400).json({ message: "No peers found" });
  }

  for (let i in peers) {
    if (await save_transactions_from_single_peer(peers[i])) {
      console.log(
        `Transactions fetched From Peer: ${peers[i].address}:${peers[i].port}`
      );
    } else {
      console.log(`Peer: ${peers[i].address}:${peers[i].port} not available`);
    }
  }

  return res.status(200).json({ message: "Transactions fetched from peers" });
};

module.exports = {
  validate_transaction,
  save_transaction,
  add_bunch_of_transactions,
  propagate_transaction,
  get_transactions,
  get_transactions_from_peer,
  get_transactions_from_all_peers,
};
