const sha256 = require("crypto-js/sha256");
const randomWords = require("random-words");
const crypto = require("crypto");
const mongoose = require("mongoose");

const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");

const TransactionClass = require("../classes/Transaction");

const functions = require("../utilities/functions");

const add_bunch_of_users = async (req, res) => {
  let user;
  for (let i = 0; i < req.body.num_users; i++) {
    const secretWords = randomWords(12);

    /*---------------------------------------------------------*/
    //    Let's convert the array to a string
    /*---------------------------------------------------------*/
    /**/ let secretWords_str = "";
    /**/ await secretWords.map((elem) => (secretWords_str += elem));
    /*---------------------------------------------------------*/
    const private_key = sha256(secretWords_str).toString();

    const key = ec.keyFromSecret(private_key);
    const public_key = key.getPublic("hex");

    user = new User({
      public_key: public_key,
      private_key: private_key,
    });
    const doc = await user.save();
  }

  return res.status(200).send("Users inserted");
};

const generate_keys = (req, res) => {
  const secretWords = randomWords(12);

  /*---------------------------------------------------------*/
  //    Let's convert the array to a string
  /*---------------------------------------------------------*/
  /**/ let secretWords_str = "";
  /**/ secretWords.map((elem) => (secretWords_str += elem));
  /*---------------------------------------------------------*/

  const key = ec.keyFromSecret(sha256(secretWords_str).toString());

  const public_key = key.getPublic("hex");
  const private_key = sha256(secretWords_str).toString();

  console.log(public_key);
  console.log(private_key);

  return res.status(200).json({
    secretWords: secretWords,
    public_key: public_key,
    private_key: private_key,
  });
};

const generate_transaction = async (req, res, next) => {
  console.log(
    "\n\nINSIDE generate_transaction, ATTEMPTING TO GENERATE THE REQUESTED TRANSACTION"
  );

  console.log("  - Requested a generation of the following transaction:");
  console.log(req.body.transaction_gen);

  console.log(
    "  - Verifying that the public key (sender address) is generated from the private key"
  );

  if (
    !functions.verify_keys(
      req.body.transaction_gen.sender,
      req.body.transaction_gen.sender_private_key
    )
  ) {
    console.log("    Keys do not correspond to each other");
    return res.status(400).json({ message: "Keys do not correspond" });
  }

  console.log("    Keys correspond");

  const transaction = new TransactionClass(
    req.body.transaction_gen.sender,
    req.body.transaction_gen.receiver,
    req.body.transaction_gen.amount
  );

  transaction.sign(req.body.transaction_gen.sender_private_key);

  req.body.transaction = transaction;
  delete req.body.transaction_gen;

  console.log("  - Final transaction sent to next middleware");
  console.log(transaction);

  next();
};

const get_balance = async (req, res, next) => {
  console.log("- Getting balance");
  const user = req.body.user;

  const data_validated = await functions.get_balance_from_user_validated(
    user.public_key
  );
  const data_in_pool = await functions.get_balance_from_user_in_pool(
    user.public_key
  );

  const balance =
    data_validated.gained +
    data_in_pool.gained -
    (data_validated.spent + data_in_pool.spent);

  console.log(`   balance: ${balance}`);

  return res.status(200).json({
    balance: balance,
  });
};

module.exports = {
  generate_keys,
  add_bunch_of_users,
  generate_transaction,
  get_balance,
};
