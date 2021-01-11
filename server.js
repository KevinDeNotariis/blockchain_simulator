const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/blockchainDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BlockSchema = require("./models/blockModel");
const Block = mongoose.model("Block", BlockSchema);
const BlockchainSchema = require("./models/blockchainModel");
const Blockchain = mongoose.model("Blockchain", BlockchainSchema);
const TransactionSchema = require("./models/transactionModel");
const Transaction = mongoose.model("Transaction", TransactionSchema);
const NodeSchema = require("./models/nodeModel");
const Node = mongoose.model("Node", NodeSchema);
const UserSchema = require("./models/userModel");
const User = mongoose.model("User", UserSchema);
const HashSchema = require("./models/hashModel");
const Hash = mongoose.model("Hash", HashSchema);

const routes = require("./routes");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", routes());

app.listen(3000, () => {
  config();
  console.log("Server listening on port 3000");
});

const config = () => {
  // prettier-ignore
  // Recover the max_id and previous_hash from db
  /**/ console.log("- Recovering max_id and previous_hash from local blockchain")
  /**/ app.locals.max_id;
  /**/ app.locals.previous_hash;
  // prettier-ignore
  /**/ Block.find((err, blocks) => {
  /**/   if (err) console.log("ERRORS IN RETRIEVING BLOCKS");
  /**/   if (!blocks) {
  /**/     console.log("STILL NO BLOCKS HERE")
  /**/   } else {
  /**/     app.locals.max_id = blocks.reduce((a, b) => {
  /**/                                  return Math.max(a.id, b.id)===a.id?a:b;
  /**/                                }).id;
  /**/     Block.findOne({ id: app.locals.max_id }, (err, block) => {
  /**/       const last_block = new Block(block);
  /**/       console.log("  last block is: ")
  /**/       console.log(last_block)
  /**/       app.locals.previous_hash = last_block.hash();
  /**/       console.log(`   max_id: ${app.locals.max_id}`);
  /**/       console.log(`   previous_hash: ${app.locals.previous_hash}`);
  /**/     });
  /**/   }
  /**/ });
};
