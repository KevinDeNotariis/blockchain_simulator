# Requirements:

- Node.js installed;
- MongoDB installed as a service;

# How to Run the simulation

## Set-up

- Clone the Repo;

- Enter the folder;

- Type in the console:

  ```
  npm i
  ```

  to install the dependencies;

- Type

  ```
  npm run dev
  ```

  to start the first node (listening on `localhost:3000`);

- In another terminal, type:

  ```
  npm run dev2
  ```

  to start the second node (listening on `localhost:3001`)

- In another terminal, type:

  ```
  npm run dev3
  ```

  to start the second node (listening on `localhost:3002`)

## Initialization

You need now to make POST requests for the following APIs in this order:

1.  POST `http://localhost:3000/blockchain/generate_genesis_block`

    This will generate the genesis block in the `blocks` collection of the `blockchainDB` database.

1.  POST `http://localhost:3001/blockchain/generate_genesis_block`

    This will generate the genesis block in the `blocks` collection of the `blockchainDB2` database.

1.  POST `http://localhost:3002/blockchain/generate_genesis_block`

    This will generate the genesis block in the `blocks` collection of the `blockchainDB3` database.

1.  POST `http://localhost:3000/users/generate_bunch_of_users`

    by adding in the `body` of the request a key-value pair as follows:

    ```
    num_user: 20
    ```

    (or whatever number of users you like)

1.  Copy these users (which will be generated in the collection `users` of the `blockchainDB` database in mongoDB) to the `users` collection of the `blockchainDB2` for the second node and to the `users` collection of the `blockchainDB3` for the third node.

1.  POST `http://localhost:3000/transactions/generate_bunch_of_transactions`

    by adding in the `body` of the request a key-value pair as follows:

    ```
    num_txs: 20
    ```

(or whatever number of transactions you like)

1. Copy these transactions (which will be generated in the collection `transactions` of the `blockchainDB` database in mongoDB) to the `transactions` collection of the `blockchainDB2` for the second node and to the `transactions` collection of the `blockchainDB3` for the third node.

## APIs

### Mining

Now that everything is set, you can mine a block in the blockchain. What you have to do is make a POST request for `http://localhost:3000/node/mine`. This call will:

1. Take some transactions from the `transactions` collection of `blockchainDB` database.

1. Construct a Block with the above transactions.

1. Start mining it, namely searching for a `nonce` in such a way that the `hash` of the Block is less than the `target` (set to 2^(240)).

1. Once mined, the bock will be added to the blockchain, namely to the `blocks` collection of the `blockchainDB` database.

1. The block will be propagated to the other peers, in this case to the other two nodes, namely to `http://localhost:3001` and `http://localhost:3002`.

1. The receiving nodes, upon receving the Block, will validate it:
   1. Does this node already have the block?
   1. Does the `previous_block` pointed by this Block exist?
   1. Does the `hash` satisfy the difficulty obstacle?
   1. Are the transactions in the Block valid?
1. Once validated, the receiver nodes will add this Block to their blockchain and propagate it to their peers.

### Generate Transactions

If you want to generate your custom transactions, you need to make a POST request to `http://localhost:3000/user/generate_transaction` (or analogously for the other nodes with `3001` and `3002` instead of `3000`) with the following JSON body:

```json
{
  "sender": <public_key of the sender>,
  "receiver": <public_key of the receiver>,
  "amount": <amount to be sent>
}
```

this API will do the following:

1. Generate the transaction with the information provided.

1. Save the transaction in the `transactions` collection of the `blockchainDB` database (or analogously for the other nodes).

1. Propagate the transactions to its peers. These will:

   1. Validate the transaction received, namely check if the signature is valid and if they already have this transaction.
   1. Save the transaction in their `transactions` collection of their blockchain database.
   1. Propagate the transaction to their peers.

### Get the blockchain

You can always look at the collection `blocks` in the `blockchainDB` to view all the blocks, or you can make a GET request to: `http://localhost:3000/blockchain/get_blockchain`.

# Features

## Cryptographic signature

EdDSA - Edwards-curve Digital Signature Algorithm, through the module `elliptic`:

```
npm i elliptic
```

> **In a nutshell:**
>
> EdDSA is a digital signature scheme using public/private key pairs. The sender sign the message using its private key and sends the message (using its public key). The receiver using the public key of the sender can verify the signature of the message, namely can verify that the private key which has been used for signing the message is paired with the sender public key.

The key pairs are generated using a list of words randomly selected by making use of the module `random-words`:

```
npm i random-words
```

In particular:

1. Generate 12 random words `['word1', 'word2', ..., 'word12']`;
2. Convert this list into a string: `'word1word2...word12'`;
3. Hash (using hash256) the string;
4. Use the hashed string as an input to `ec.keyFromSecret` method of `EdDSA("ed25519")`, namely:

   ```js
   const EdDSA = require("elliptic").eddsa;
   const ec = new EdDSA("ed25519");

   ...

   const key_pair = ec.keyFromSecret(hashed_string)
   ```

## Merkle Tree

The transactions in a block will be stored as a Merkle Tree (or Binary hash tree). The root of the tree will be stored in the Header of the block, while the transactions themeselves will be stored in the body of the block (like in the Bitcoin blockchain)

A proof for the belonging of a given transaction (its hash) to the Merkle Tree is given by a sequence of hashes, thanks to which one can see whether the resulting hash is the root of the Merkle Tree the transaction is said to be belonging to.

### Example:

Suppose we have the following Merkle Tree:

```
                        block_12345678 === root
                      /                        \
                     /                          \
                    /                            \
                   /                              \
                  /                                \
                 /                                  \
            block_1234                          block_5678
           /          \                        /          \
          /            \                      /            \
         /              \                    /              \
        /                \                  /                \
    block_12          block_34          block_56          block_78
   /       \         /       \         /       \         /       \
leaf_1   leaf_2   leaf_3   leaf_4   leaf_5   leaf_6   leaf_7   leaf_8
```

where each "block" is actually an hash calculated as the hash of the sum of its children hashes:

```
block = hash(block.child_1 + block.child_2)
```

Suppose now that we would like to build a "proof" that the `leaf_4` belongs to the Merkle Tree with root given by `block_12345678`

Then we can consider the following sequence of blocks:

```
[leaf_4, leaf_3, block_12, block_5678]
```

together with another array storing only zeros and ones stating if we have to sum the blocks in the order they appear or exchange them (will be more clear soon):

```
[1, 1, 0]
```

> In fact when we concatenate two strings, namely we do something like `string_a + string_b` we need to rememeber that this plus is not commutative! So clearly `hash(string_a + string_b) != hash(string_b + string_a)` and we need to know the correct order in which we need to sum the strings to obtain the correct hash in the Merkle tree.

These two arrays will give a proof that the `leaf_4` is in the Merke Tree, in fact:

1. We take the first two blocks in the first array. Check the first element in the second array. If it is a 0 we add them as they appear (namely we would do `hash(leaf_4 + leaf_5)`), while if it is a 1 we exchange in the hash calculation. In this case we find a 1 in the second array, so we construct:

   ```
   hash(leaf_3+leaf_4) = block_34
   ```

   and we replace the first two blocks in the sequence with this new block, to obtain:

   ```
   [block_34, block_12, block_5678]
   ```

1. We take again the first two elements, and look to the next element in the second array. We find again a 1, meaning that we need to exchange the elements in the sum:

   ```
   hash(block_12 + block_34) = block_1234
   ```

   and replace the blocks used with the computed one, to obtain:

   ```
   [block_1234, block_5678]
   ```

1. Finally we take these two blocks and look at the last element in the second array. It is a 0, meaning that we keep the order:

   ```
   hash(block_1234 + block_5678) = block_12345678
   ```

Now, if this last block hash is equal to the root of the Merkle Tree, then it means that the block we wanted to test is indeed part of Merkle Tree.
