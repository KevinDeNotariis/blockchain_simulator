const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/blockchainDB2", {
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
const PeerSchema = require("./models/peerModel");
const Peer = mongoose.model("Peer", PeerSchema);

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

app.listen(3001, async () => {
  await config();
  console.log("Server listening on port 3001");
});

const config = async () => {
  return new Promise(async (resolve) => {
    //set the global variable port
    app.locals.port = 3001;

    // Recover the max_id and previous_hash from db
    console.log("- Recovering max_id and previous_hash from local blockchain");
    app.locals.max_id;
    app.locals.previous_hash;
    const blocks = await Block.find();
    if (blocks.length === 0) {
      console.log("STILL NO BLOCKS HERE");
    } else {
      app.locals.max_id = blocks.reduce((a, b) => {
        return Math.max(a.id, b.id) === a.id ? a : b;
      }).id;
      const block = await Block.findOne({ id: app.locals.max_id });
      const last_block = new Block(block);
      console.log("  last block is: ");
      console.log(last_block);
      app.locals.previous_hash = last_block.hash();
      console.log(`   max_id: ${app.locals.max_id}`);
      console.log(`   previous_hash: ${app.locals.previous_hash}`);
    }
    resolve();
  });
};
