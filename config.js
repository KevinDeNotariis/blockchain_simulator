const config = {
  peers: [
    {
      address: "localhost",
      port: 3001,
      setup: false,
      public_key:
        "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e",
      private_key:
        "dab84cdd005060e9d8af919ec78ea59f2349753b6a9dd9c1215e50c63a60b623",
      db: "blockchainDB",
    },
    {
      address: "localhost",
      port: 3002,
      setup: false,
      public_key:
        "9c3b4f5917b6d4323348ee6e59990f60ab2630d7709fbb28d06a2deb8924445b",
      private_key:
        "f36391557df9408c4a7e167281e190f08c6accc8f4b6f8e5870d1da2e5409aeb",
      db: "blockchainDB2",
    },
    {
      address: "localhost",
      port: 3003,
      setup: false,
      public_key:
        "efd36e8778bd33d1640f1b1186119a03009d49409cb72202fc426be79af19e77",
      private_key:
        "2dd93a63d7b1e6af3a7e23190fba6b4b94068373a08a1cfbe1fad0b9882bfa42",
      db: "blockchainDB3",
    },
  ],
  setUp: {
    users_num: 100,
    transactions_num: 100,
    blocks_num: 10,
    initial_money: 300000,
    initial_difficulty: Math.pow(2, 256 - 16),
    initial_amount_range: 100,
  },
  coinbase: {
    public: "b67a2d14f2613558b2410508fdd4b40a751a60f239cc9f95a43cae15f39565b7",
    private: "coinbase",
  },
  max_txs_in_block: 6,
  mining_reward: 100,
};

module.exports = { config };
