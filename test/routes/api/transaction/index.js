let server = require("../../../../server");
let server2 = require("../../../../server2");
const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction");
const Block = mongoose.model("Block");
const User = mongoose.model("User");
const Hash = mongoose.model("Hash");
const Peer = mongoose.model("Peer");

let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();

chai.use(chaiHttp);
describe("Transaction", () => {
  /*beforeEach((done) => {
  });*/
  describe("/POST /", () => {
    it("it should validate and eventually save a correct transaction", (done) => {
      const data = {
        transaction_gen: {
          sender:
            "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e",
          receiver:
            "95bbfffc0ff44e710ae01e88be97e100d05ac255976e00d0aa3458cde236ff4b",
          amount: 233,
          sender_private_key:
            "dab84cdd005060e9d8af919ec78ea59f2349753b6a9dd9c1215e50c63a60b623",
        },
      };

      chai
        .request(server)
        .post("/api/transaction")
        .send(data)
        .end((err, res) => {
          res.body.should.have.property("propagation_res");
          res.body.propagation_res.should.have.property("contacted");
          res.body.should.have.property("transaction");
          done();
        });
    });
  });
});
