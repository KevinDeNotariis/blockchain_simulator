const crypto = require("crypto");
const mongoose = require("mongoose");
const qs = require("qs");
const http = require("http");

const functions = require("../utilities/functions");
const dbManagement = require("../utilities/dbManagement");

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
  const transactions = await dbManagement.get_all_transactions();

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
  console.log(transaction);
  console.log("  - validation of the transaction");

  console.log("  - checking the validity of the signature in the transaction");

  if (!transaction.verify()) {
    console.log("Transaction is not valid");
    return res.status(400).json({ message: "Transaction is not valid" });
  }

  console.log("    signature valid.");

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
    { transaction: req.body.transaction },
    "/api/transaction",
    "PUT"
  );

  console.log("  - transaction sent.");

  return res.status(200).send({
    propagation_res: return_str,
    transaction: req.body.transaction,
  });
};

const get_transactions_from_peer = async (req, res) => {
  console.log(req.body);
  const txs = await functions.fetch_transactions_from_single_peer(
    req.body.peer
  );
  if (txs.message === "Peer not available") {
    return res.status(503).json(txs);
  } else if (txs.transactions.length !== 0) {
    let ret = [];
    let counter = txs.transactions.length;
    for (i in txs.transactions) {
      let this_transaction = txs.transactions[i];
      const post_data = qs.stringify(
        JSON.parse(JSON.stringify({ transaction: this_transaction }))
      );
      const options = {
        host: req.app.locals.config.address,
        port: req.app.locals.config.port,
        path: "/api/transaction/no_propagation",
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(post_data),
        },
      };
      let res_from_api = "";

      const request = http.request(options, (response) => {
        response.on("data", (chunk) => {
          res_from_api += chunk.toString("utf-8");
        });
        response.on("end", () => {
          let res_from_api_json = JSON.parse(res_from_api);
          res_from_api_json.transaction = this_transaction.id;
          ret.push(res_from_api_json);
          counter--;
          if (counter === 0) {
            return res.status(200).json(ret);
          }
        });
      });
      request.write(post_data);
      request.end();
    }
  } else {
    return res.status(200).json({
      message: "Transactions are already in DB",
    });
  }
};

const get_transactions_from_all_peers = async (req, res) => {
  const peers = await functions.check_peers_availability();
  console.log(peers);
  if (peers.length === 0)
    return res.stauts(400).json({ message: "No peers available" });
  else {
    let counter = peers.length;
    let ret_obj = [];
    for (let i in peers) {
      const current_peer = peers[i];
      const data = qs.stringify(
        JSON.parse(
          JSON.stringify({
            peer: current_peer,
          })
        )
      );
      const options = {
        host: req.app.locals.config.address,
        port: req.app.locals.config.port,
        path: "/api/transaction/from_peer",
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(data),
        },
      };
      let peer_res = "";
      const request = http.request(options, (response) => {
        response.on("data", (chunk) => {
          peer_res += chunk.toString("utf-8");
        });
        response.on("end", () => {
          counter--;
          ret_obj.push({
            peer: {
              address: current_peer.address,
              port: current_peer.port,
            },
            res: JSON.parse(peer_res),
          });
          if (counter === 0) {
            return res.status(200).json(ret_obj);
          }
        });
      });
      request.write(data);
      request.end();
    }
  }
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
