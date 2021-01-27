const sha256 = require("crypto-js/sha256");
const randomWords = require("random-words");
const crypto = require("crypto");
const mongoose = require("mongoose");

const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");

const add_bunch_of_users = async (req, res) => {
  let user;
  for (let i = 0; i < req.body.num_users; i++) {
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

    user = new User({
      public_key: public_key,
      private_key: private_key,
    });
    const doc = await user.save();
  }

  return res.status(200).send("Users inserted");
};

/*------ generate_keys ---------
  output: 
    secretWords: String[12] 
    public_key: String
    private_key: String
*/

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
  const transaction = new Transaction({
    id: crypto.randomBytes(32).toString("hex"),
    sender: req.body.sender,
    receiver: req.body.receiver,
    amount: req.body.amount,
  });

  console.log("  - generated the following transaction:");
  console.log(transaction);

  console.log(
    "  - recovering the private key from the users collection for the sender"
  );
  let user = await User.findOne({ public_key: req.body.sender });
  if (!user) return res.json(400).json({ message: "User not found" });

  console.log("  - private key recovered");
  transaction.sign(user.private_key);

  req.body = transaction;

  console.log("  - final transaction sent to save_transaction");
  console.log(transaction);

  next();
};

module.exports = {
  generate_keys,
  add_bunch_of_users,
  generate_transaction,
};
