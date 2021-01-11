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

## Initialization

You need now to make POST requests for the following APIs in this order:

1.  POST `http://localhost:3000/blockchain/generate_genesis_block`

    This will generate the genesis block in the `blocks` collection of the `blockchainDB` database.

1.  POST `http://localhost:3001/blockchain/generate_genesis_block`

    This will generate the genesis block in the `blocks` collection of the `blockchainDB2` database.

1.  POST `http://localhost:3000/users/generate_bunch_of_users`

    by adding in the `body` of the request a key-value pair as follows:

    ```
    num_user: 20
    ```

    (or whatever number of users you like)

1.  Copy these users (which will be generated in the collection `users` of the `blockchainDB` database in mongoDB) to the `users` collection of the `blockchainDB2` for the second node.

1.  POST `http://localhost:3000/transactions/generate_bunch_of_transactions`

    by adding in the `body` of the request a key-value pair as follows:

    ```
    num_txs: 20
    ```

(or whatever number of transactions you like)

1. Copy these transactions (which will be generated in the collection `transactions` of the `blockchainDB` database in mongoDB) to the `transactions` collection of the `blockchainDB2` for the second node.

## APIs

### Mining

Now that everything is set, you can mine a block in the blockchain. What you have to do is make a POST request for `http://localhost:3000/node/mine`. This call will:

1. Take some transactions from the `transactions` collection of `blockchainDB` database.
1. Construct a Block with the above tranasctions.
1. Start mining it, namely searching for a `nonce` in such a way that the `hash` of the Block is less than the `target` (set to 2^(240)).
1. Once mined, the bock will be added to the blockchain, namely to the `blocks` collection of the `blockchainDB` database.
1. The block will be propagated to the other peers, in this case to the other node, namely to `http://localhost:3001`.
1. The second node, upon receving the Block, will validate it:
   1. Does the `previous_block` pointed by this Block exist?
   1. Does the `hash` satisfy the difficulty obstacle?
   1. Are the transactions in the Block valid?
1. Once validated, the second node will add this Block to its blockchain

### Return the blockchain

You can always look at the collection `blocks` in the `blockchainDB` to view all the blocks, or you can make a GET request to: `http://localhost:3000/blockchain/get_blockchain`.

# Features

## Cryptographic signature

EdDSA - Edwards-curve Digital Signature Algorithm, through the module `elliptic`:

```
npm i elliptic
```

> **In a nutshell:**
>
> EdDSA is a digital signature scheme using public/private key pairs. The sender sign the message using its private key and sends the message (using its public key). The receiver using the public key of the sender can verify the signature of the message, namely can verify that the private key which has been using for signing the message is paired with the sender public key.

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
