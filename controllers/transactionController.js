const crypto = require("crypto");
const mongoose = require("mongoose");

const functions = require("../utilities/functions");

const Transaction = mongoose.model("Transaction");
const User = mongoose.model("User");
const Peer = mongoose.model("Peer");
const Block = mongoose.model("Block");

const TransactionClass = require("../classes/Transaction");

const add_bunch_of_transactions = async (req, res) => {
  console.log(`Number of transactions to be added: ${req.body.num_txs}`);
  let doc_num = (await User.find({})).length;
  for (let i = 0; i < req.body.num_txs; i++) {
    const sender = (
      await User.findOne({}, null, {
        skip: Math.floor(Math.random() * doc_num),
      })
    ).public_key;
    console.log(sender);
    const receiver = (
      await User.findOne({}, null, {
        skip: Math.floor(Math.random() * doc_num),
      })
    ).public_key;
    console.log(receiver);
    const transaction = new Transaction({
      id: crypto.randomBytes(32).toString("hex"),
      sender: sender,
      receiver: receiver,
      amount: Math.floor(Math.random() * 1000),
    });

    const user = await User.findOne({ public_key: sender });
    if (!user) {
      return res.status(400).message({ message: "User not found" });
    }
    transaction.sign(user.private_key);
    await transaction.save();
    console.log("Added the above transaction");
  }
  return res.status(200).send("Transaction added");
};

const get_transactions = async (req, res) => {
  const transactions = await Transaction.find({});

  return res.status(200).json(transactions);
};

const get_transactions_pool = async (req, res) => {
  const transactions_pool = await Transaction.find({});

  return res.status(200).json(transactions_pool);
};

const save_transaction = async (req, res, next) => {
  console.log(
    "\n\nINSIDE save_transaction, ATTEMPTING TO SAVE THE TRANSACTION IN THE POOL"
  );
  const transaction = new Transaction(req.body.transaction);

  await transaction.save();
  console.log("  - transaction saved successfully");

  next();
};

const validate_transaction = async (req, res, next) => {
  const transaction = new TransactionClass(req.body.transaction);
  //Info printing
  console.log(
    "\n\nINSIDE validate_transaction, RECEIVED THE FOLLOWING TRANSACTION:"
  );

  console.log("  - checking the validity of the signature in the transaction");

  if (!transaction.verify()) {
    console.log("Transaction is not valid");
    return res.status(400).json({ message: "Transaction is not valid" });
  }

  console.log("    signature valid.");

  console.log(transaction);
  console.log("  - validation of the transaction");
  console.log("  - checking whether this node has already the transaction");

  //First check whether the node has already the transaction in the transactions collection
  const tx = await Transaction.findOne({
    id: transaction.id,
  });
  if (tx) {
    console.log("Already got that transaction");
    return res.status(400).json({ message: "Transaction already in the pool" });
  }

  //Check if the transaction is in one of the blocks that the peer has
  let block = await Block.findOne({ "transactions.id": transaction.id });
  if (block) {
    console.log("The transaction is already in a block");
    return res.status(400).json({ message: "Transaction already in a block" });
  }

  console.log("    the node does not have the transaction.");

  //Check whether the sender has sufficient funds to make the transaction
  console.log("  - checking whether the sender has sufficient funds");
  const validated_balance = await functions.get_balance_from_user_validated(
    transaction.sender
  );
  const in_pool_balance = await functions.get_balance_from_user_in_pool(
    transaction.sender,
    transaction.timestamp
  );

  const balance =
    validated_balance.gained +
    in_pool_balance.gained -
    (validated_balance.spent + in_pool_balance.spent);
  console.log(
    `    sender has available: ${balance} and the required amount for the transaction is: ${transaction.amount}`
  );

  if (balance < transaction.amount) {
    console.log("    not enough funds for the sender");
    return res.status(400).json({ message: "Sender has not enough funds" });
  }
  console.log("    the sender has enough funds");

  console.log("exiting the middleware");

  next();
};

const propagate_transaction = async (req, res) => {
  console.log(
    "\n\nINSIDE propagate_transaction, ATTEMPTING TO SEND TRANSACTION TO PEERS"
  );
  const return_str = await functions.propagate_to_peers(
    tx,
    "/transaction",
    "PUT"
  );

  console.log("  - transaction sent.");

  return res.status(200).send(return_str);
};

const get_transactions_from_peer = async (req, res) => {
  if (await functions.save_transactions_from_single_peer(req.body.peer)) {
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
    if (await functions.save_transactions_from_single_peer(peers[i])) {
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
  get_transactions_pool,
  get_transactions_from_peer,
  get_transactions_from_all_peers,
};
