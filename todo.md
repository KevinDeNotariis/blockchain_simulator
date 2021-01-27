## TODO list

- [x] change the implementation of the models following the new /classes
- [ ] change everywhere the implementation of Blocks, Transactions, etc.. following the new classes in /classes
- [ ] implement propagation of blocks
- [ ] implement, when verifying a transaction, that the sender has the funds
- [ ] implement different type of nodes, those that may not require the full blockchain, but still can verify transactions (thanks to the Merkle tree structure)
- [ ] implement the reward for mining a block as a transaction (the first) from the coinbase to the miner for a fixed value of money
- [ ] implement the log in the front-end
- [ ] when a node receive a valid block, it needs to take the transactions validated in the block out from their transactions collection
- [ ] when fetching blocks, the node will try to fetch from the peer with the longest blockchain
- [ ] implement the possibility for the client to click on a user and see the list of its transactions, balance, etc.. (like a wallet)
- implement the fetching of transactions, blocks, etc.. from peers when a node wakes up
