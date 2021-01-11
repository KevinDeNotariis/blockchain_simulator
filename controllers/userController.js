const sha256 = require("crypto-js/sha256");
const randomWords = require("random-words");
const mongoose = require("mongoose");

const EdDSA = require("elliptic").eddsa;
const ec = new EdDSA("ed25519");

const User = mongoose.model("User");

const add_bunch_of_users = (req, res) => {
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
    user.save((err, doc) => {
      if (err) return res.status(401).json({ message: err });
      console.log("Added the following user:");
      console.log(doc);
    });
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
module.exports = { generate_keys, add_bunch_of_users };
