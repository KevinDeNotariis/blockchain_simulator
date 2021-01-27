##TODO list

- [x] change the implementation of the models following the new /classes
- [ ] change everywhere the implementation of Blocks, Transactions, etc.. following the new classes in /classes
- [ ] implement propagation of blocks
- [ ] implement, when verifying a transaction, that the sender has the funds
- [ ] implement distinction between transaction pool and all transactions
- [ ] implement different type of nodes, those that may not require the full blockchain, but still can verify transactions (thanks to the Merkle tree structure)
- [ ] implement the reward for mining a block as a transaction (the first) from the coinbase to the miner for a fixed value of money
- [ ] implement priority of transactions when stacking in the memory pool
