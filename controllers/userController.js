const sha256 = require("crypto-js/sha256");
const randomWords = require("random-words");

const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

const User = require("../models/userModel");

const TransactionClass = require("../classes/Transaction");

const functions = require("../utilities/functions");

const add_bunch_of_users = async (req, res) => {
  let users_pub_keys = [];
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
      secret_words: secretWords,
    });
    users_pub_keys.push(public_key);
    await user.save();
  }

  return res.status(200).json({
    users: users_pub_keys,
    message: "Users inserted",
  });
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
    message: "Keys generated",
    keys: {
      secretWords: secretWords,
      public_key: public_key,
      private_key: private_key,
    },
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

  if (!transaction.sign(req.body.transaction_gen.sender_private_key)) {
    console.log("Error in signing the transaction");
    return res
      .status(400)
      .json({ message: "Error in signing the transaction" });
  }

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

  const balance = data_validated.gained - data_validated.spent;

  console.log(`   balance: ${balance}`);

  return res.status(200).json({
    user: user,
    balance: balance,
  });
};

const get_user_by_id = async (req, res, next) => {
  const public_key = req.params.public_key;

  const user = await User.findOne({ public_key: public_key });

  if (!user) next();

  const transactions_validated = await functions.get_transactions_from_user_validated(
    public_key
  );

  const transactions_pool = await functions.get_transactions_from_user_pool(
    public_key
  );

  const balance_validated = await functions.get_balance_from_user_validated(
    public_key
  );

  const balance_pool = await functions.get_balance_from_user_in_pool(
    public_key
  );
  req.body.user_info = {};
  req.body.user_info.user = user;
  req.body.user_info.transactions_validated = transactions_validated;
  req.body.user_info.transactions_pool = transactions_pool;
  req.body.user_info.balance_validated = balance_validated;
  req.body.user_info.balance_pool = balance_pool;

  next();
};

module.exports = {
  generate_keys,
  add_bunch_of_users,
  generate_transaction,
  get_balance,
  get_user_by_id,
};
