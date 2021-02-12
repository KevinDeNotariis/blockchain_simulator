## TODO list

- [x] change the implementation of the models following the new /classes
- [ ] change everywhere the implementation of Blocks, Transactions, etc.. following the new classes in /classes
- [x] implement propagation of blocks
  - [x] implement a `PUT /block` API which will be called from other peers when they want to propagate their blocks.
    - [x] implement the validation of a block middleware, which includes:
      1. check whether the block id (the height) is higher, lower or equals to the current one,
      1. check whether the `previous_hash` corresponds to the hash of the block with the previous id.
      1. check whether the `hash` satisfies the difficulty constraint.
      1. check whether the transactions in the block are valid.
- [x] implement, when verifying a transaction, that the sender has the funds
- [x] implement get_balance method:
  - [x] get balance from validated transactions.
  - [x] check for transactions in the pool.
- [ ] implement the priority system for transactions in the pool
- [ ] implement different types of nodes, those that may not require the full blockchain, but still can verify transactions (thanks to the Merkle tree structure)
- [ ] check and update the availability of peers when a node wakes up
- [ ] implement the reward for mining a block as a transaction (the first) from the coinbase to the miner for a fixed value of money:
  - [ ] implement, when validating a block, that the first transaction is a coinbase transaction
  - [ ] check that the amount of the transaction from the coinbase to the miner is the right amount
    - [ ] implement a fixed or variable amount to give as a reward to miners
- [ ] implement the log in the front-end
- [ ] when a node receive a valid block, it needs to take the transactions validated in the block out from their transactions collection
- [ ] when fetching blocks, the node will try to fetch from the peer with the longest blockchain
- [ ] implement the possibility for the client to click on a user and see the list of its transactions, balance, etc.. (like a wallet)
- [ ] implement the fetching of transactions, blocks, etc.. from peers when a node wakes up
- [ ] implement the forking of the blockchain, namely:
  - [ ] the possibility of having more blocks with the same id (aka height)
  - [ ] the fact that a block may arrive before the previous one --> orphan blocks
- [ ] implement an object - PropagateData - that stores the peers it has already visited, in order to not send it to the same peers all over again.
- [x] refactor routes:
  - [x] refactor transaction routes
  - [x] refactor user routes
  - [x] refactor peer routes
  - [x] refactor block routes
  - [x] refactor blockchain routes
  - [x] refactor node routes
- [x] refactor APIs:
  - [x] transaction
  - [x] user
  - [x] peer
  - [x] block
  - [x] blockchain
  - [x] node
- [ ] implement communication protocols for transactions and blocks propagation. When a peer wants to send a block, it may just send the header, the receiver will check it, and if it does not already have it and everything is fine, then the sender may send the whole block.
- [ ] remove max_id and previous_hash from app.locals everywhere (and user db functions to extract it when necessary)
