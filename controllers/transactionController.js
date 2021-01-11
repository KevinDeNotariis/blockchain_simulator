const crypto = require("crypto");
const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction");
const User = mongoose.model("User");

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

//------ add_transaction -------------
/*
  inputs:
      sender
      receiver
      amount
      private_key of the sender to sign transaction

  outout:
      transaction just registered 
*/

const add_transaction = (req, res) => {
  const transaction = new Transaction({
    id: crypto.randomBytes(32).toString("hex"),
    sender: req.body.sender,
    receiver: req.body.receiver,
    amount: req.body.amount,
  });

  transaction.sign(req.body.private_key);

  transaction.save((err, tx) => {
    if (err) return res.status(401).json({ message: err });

    return res.status(200).json(tx);
  });
};

// ---------- validate_transaction ---------------
/*
    API endpoint to check whether a transaction is valid.
    
    input:
     transaction

    output:
     true / false
*/

const validate_transaction = (req, res) => {
  const transaction = new Transaction(
    req.body.id,
    req.body.sender,
    req.body.receiver,
    req.body.amount
  );
  console.log(transaction);

  transaction.signature = req.body.signature;

  return res.status(200).json({ result: transaction.verify() });
};

module.exports = {
  add_transaction,
  validate_transaction,
  add_bunch_of_transactions,
};
