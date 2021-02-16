const express = require("express");
const app = express();

const bodyParser = require("body-parser");
require("dotenv").config();

//set the global variables
const configuration = require("./config");
app.locals.config = configuration.config.peers[2];
console.log({ config: app.locals.config });

const mongoose = require("mongoose");
mongoose.connect(`mongodb://localhost/${app.locals.config.db}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BlockSchema = require("./models/blockModel");
const Block = mongoose.model("Block", BlockSchema);
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

app.listen(app.locals.config.port, async () => {
  await initial_setup();
  console.log(`Server listening on port ${app.locals.config.port}`);
});

const initial_setup = async () => {
  return new Promise(async (resolve) => {
    // Recover the max_id and previous_hash from db
    console.log("- Recovering max_id and previous_hash from local blockchain");
    const hashes = await Hash.find({});
    if (!hashes) console.log("No blocks yet");
    else if (hashes.length === 0) console.log("No blocks yet");
    else {
      const last = await hashes.reduce((a, b) => {
        return Math.max(a.block_id, b.block_id);
      });
      console.log(`  max_id = ${last.block_id}`);
      console.log(`  previous_hash = ${last.block_hash}`);
    }
    resolve();
  });
};

module.exports = app;
