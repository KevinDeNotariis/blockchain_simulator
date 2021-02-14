# Table of contents

1. [Transactions](#transactions)

   1. [POST /api/transaction](#post-api/transaction)
   1. [PUT /api/transaction](#post-api/transaction)
   1. [GET /api/transaction/from_peer](#get-api/transaction/from_peer)
   1. [GET /api/transaction/from_all_peers](#get-api/transactionfrom_all_peers)
   1. [GET /api/transaction/validation/complete](#get-/api/transaction/validation/complete)
   1. [GET /api/transaction/validation/partial](#get-/api/transaction/validation/partial)

1. [Users](#users)

   1. [POST /api/user/bunch_of](#post-api/user/bunch_of)
   1. [GET /api/user/generate_keys](#get-api/user/generate_keys)
   1. [GET /api/user/balance](#get-api/user/balance)

1. [Peers](#peers)

   1. [GET /api/peer](#get-api/peer)
   1. [PUT /api/peer](#put-api/peer)
   1. [DELETE /api/peer](#delete-api/peer)
   1. [PUT /api/peer/discover](#put-api/peer/discover)

1. [Nodes](#nodes)

   1. [POST /api/node/mine](#post-api/node/mine)

1. [Blocks](#blocks)
   1. [PUT /api/block](#put-/api/block)
   1. [GET /api/block/:id](#get-/api/block/:id)
   1. [GET /api/block/last](#get-/api/block/last)
   1. [GET /api/block/validate](#get-/api/block/validate)

# Transactions

## POST /api/transaction

Endpoint which takes a transaction as a user would create it, validate it, save it in the transaction pool and then sends it to the other peers.

body example:

```json
{
  "transaction_gen": {
    "sender": "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e",
    "receiver": "95bbfffc0ff44e710ae01e88be97e100d05ac255976e00d0aa3458cde236ff4b",
    "amount": 233,
    "sender_private_key": "dab84cdd005060e9d8af919ec78ea59f2349753b6a9dd9c1215e50c63a60b623"
  }
}
```

This request will pass through the following middlewares:

```
   ┌──────────────────────────────────────┐
   │ userController.generate_transaction  │
   └──────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ transactionController.complete_validation   │
└─────────────────────────────────────────────┘
                      ↓
  ┌─────────────────────────────────────────┐
  │ transactionController.save_transaction  │
  └─────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ transactionController.propagate_transaction  │
└──────────────────────────────────────────────┘
```

| Middleware                                | Steps (in this sequence)                                                                                                                                                | Return if not passed                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| userController.generate_transaction       | Check whether the `sender_private_key` is really what it claims to be (namely it will check that the public key generated using the private key coincide with `sender`) | Status 400 with "message": "Keys do not correspond"          |
| userController.generate_transaction       | Sign it                                                                                                                                                                 |                                                              |
| transactionController.complete_validation | Check whether the signature is valid (it should, since the node itself signed it, but this part is in a common `complete_validation` middleware)                        | Status 400 with "message": "Transaction is not valid"        |
| transactionController.complete_validation | Check whether the node has already the transaction in the pool                                                                                                          | Status 400 with "message": "Transaction already in the pool" |
| transactionController.complete_validation | Check whether the node has already the transaction validated in a block                                                                                                 | Status 400 with "message": "Transaction already in a block"  |
| transactionController.complete_validation | Check whether the sender has sufficient funds                                                                                                                           | Status 400 with "message": "Sender has not enough funds"     |

If everything is fine, it will save the transaction in the transaction pool (in the `transactions` collection) and then contact other peers. The final response should be something like the following (for two peers available)

```json
{
  "propagation_res": {
    "contacted": [
      "Peer: localhost:3001 has been contacted through the API: PUT /api/transaction",
      "Peer: localhost:3002 has been contacted through the API: PUT /api/transaction"
    ]
  },
  "transaction": {
    "sender": "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e",
    "receiver": "95bbfffc0ff44e710ae01e88be97e100d05ac255976e00d0aa3458cde236ff4b",
    "amount": 233,
    "id": "19d9c441ee89b49e35b9c875ff43b3b99fc052bb0eb48460c83a1d632adb7485",
    "timestamp": 1612444188716,
    "signature": "75031A65AD197333488655299272A79139B576CB9DA4C3433B2DA18AFB49E0A5D1D0944EE7F22EE6EB318DE9598C1D249BF20A62F8D0F559CB59B83D2E14C10B"
  }
}
```

## PUT /transaction

Takes a transaction (usually from another peer), validate it, save it in the transaction pool (if valid) and then propagate it to other peers.

body example:

```json
{
  "transaction": {
    "sender": "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e",
    "receiver": "95bbfffc0ff44e710ae01e88be97e100d05ac255976e00d0aa3458cde236ff4b",
    "amount": 233,
    "id": "6c36a24a7676de49488eec5d940e3655139aff32dc573f083a75a4e52f22077c",
    "timestamp": 1612287459405,
    "signature": "A9BD0B8B67F5BA8BBC30A250C1644D7C4A216FEE54D25C9C2BFDC854169F821B37E22F0E39D94467BDA6BDAD18EDB800A5D7AF6AAFFD0EB45D92561CBE931F07"
  }
}
```

This request will pass through the following middlewares:

```
┌─────────────────────────────────────────────┐
│ transactionController.complete_validation   │
└─────────────────────────────────────────────┘
                      ↓
  ┌─────────────────────────────────────────┐
  │ transactionController.save_transaction  │
  └─────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ transactionController.propagate_transaction  │
└──────────────────────────────────────────────┘
```

Response should be similar to the following (for two peers available):

```json
{
  "propagation_res": {
    "contacted": [
      "Peer: localhost:3001 has been contacted through the API: PUT /api/transaction",
      "Peer: localhost:3002 has been contacted through the API: PUT /api/transaction"
    ]
  },
  "transaction": {
    "sender": "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e",
    "receiver": "95bbfffc0ff44e710ae01e88be97e100d05ac255976e00d0aa3458cde236ff4b",
    "amount": 233,
    "id": "3039caad5a41f765a65cc3c842e14e98169fa6385d9fb912f7a9c2233897ab3e",
    "timestamp": 1612444468803,
    "signature": "741222E0340CA83B5748AF9A31E05BE72178B64EFBBB9BE1AB2D649839EB5795A56E19261AD7CE0323BC5F2AFE4E5004137876CA98807D50EF8049ECD74B7D0D"
  }
}
```

## GET /api/transaction/from_peer

Fetch the transactions in the transaction pool of the peer passed in the body. Once the transactions (not already in the DB) are fetched, it will call `PUT /api/transaction/no_propagation` for every transaction, so that it will validate and then save them.

body example:

```json
{
  "peer": {
    "address": "localhost",
    "port": "3001"
  }
}
```

Response example:

In the case of 5 correct transactions fetched, the response should look like:

```json
[
  {
    "message": "Transaction saved",
    "transaction": "329fc76aaa59abd16afbb35f4af6e56962ea943bbf319e08be0c177471fecfd8"
  },
  {
    "message": "Transaction saved",
    "transaction": "8a6a78843b8bba3707be696a509daba16071a7beffb074d09a754bbafb84af1d"
  },
  {
    "message": "Transaction saved",
    "transaction": "61ebf58b5ec93f5ef72a80048f421482e9c498af76122e7e249751ae88947fff"
  },
  {
    "message": "Transaction saved",
    "transaction": "f87ae79f787bec2efda35fb78b8f3d3bade4b40cbf0a164177e9aa121c8fe5c3"
  },
  {
    "message": "Transaction saved",
    "transaction": "0218cbae04d70b70a00297a908af1089e325433231da1caf6163c122bfaea92a"
  }
]
```

## GET /api/transaction/validation/complete

## GET /api/transaction/validation/partial

# Users

## POST /api/user/bunch_of

This API will create a bunch of users (specified in the body) and save them in the `users` collection. In the body of the request, the number of users to be generated can (and must) be specified as follows:

```json
{
  "num_users": <num of users to be generated>
}
```

The response, if everything went good, should contain a message and a list of the users' public_key created:

```json
{
  "users": [
    <user_1 public_key>,
    <user_2 public_key>,
    ...
  ]
  "message": "Users inserted"
}
```

## GET /api/transaction/from_all_peers

This API will search for available peers, and for each peer, it will call `GET /api/transaction/from_peer` to get the transactions from that peer.

Response example for 2 transactions fetched from peer `localhost:3002` and 3 transactions fetched from `lcoalhost:3003`:

```json
[
  {
    "peer": {
      "address": "localhost",
      "port": 3003
    },
    "res": [
      {
        "message": "Transaction saved",
        "transaction": "9247d4313ade2ea54f62e497fc7bc027a62aa0bccac605a020c36418c25faf84"
      },
      {
        "message": "Transaction saved",
        "transaction": "4fe7de8281b6d54d76f04b3db80b99c78b0aa4dc9e92c9b63be4655650f6e165"
      },
      {
        "message": "Transaction saved",
        "transaction": "aa3b4ab541d6d818b3f5509919352db42f0584e92128e61085dd0ad734d3aa19"
      }
    ]
  },
  {
    "peer": {
      "address": "localhost",
      "port": 3002
    },
    "res": [
      {
        "message": "Transaction saved",
        "transaction": "a8fcbbaa8d422b0047cda10c8b78df35edc16c86a6f5c5b3bd7e53b4de501617"
      },
      {
        "message": "Transaction saved",
        "transaction": "8a1b8f0e932ad9e129daebdcc7a77e71ae94654fe064f125f17a545b640e9c16"
      }
    ]
  }
]
```

## GET /api/user/generate_keys

Will return a triple of (`public_key`,`private_key`,`secret_words`) under `keys` and a message.

Response example:

```json
{
  "message": "Keys generated",
  "keys": {
    "secretWords": [
      "camera",
      "division",
      "zoo",
      "police",
      "beginning",
      "greatly",
      "coming",
      "written",
      "definition",
      "reason",
      "doll",
      "drove"
    ],
    "public_key": "304017419b145159cf83046666e938bb61988eca3b06ac77bdce245c40e66e32",
    "private_key": "8503f07d6d73ec67550c46f7a26136dfa07d2c8a92683d9a11cd1dfeb1b7b49a"
  }
}
```

## GET /api/user/balance

Passing a user, it will return the balance of that user, considering only the transactions validated in the blockchain.

Body example:

```json
{
  "user": {
    "public_key": "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e"
  }
}
```

response example:

```json
{
  "user": {
    "public_key": "a84bc05b20efa2a8d8ab917f22025891f6326c645566be6b0bca9a95abf12a3e"
  },
  "balance": 98402
}
```

# Peers

## GET /api/peer

Returns all the peers in the database.

Response example:

```json
{
  "message": "Peers fetched from DB",
  "peers": [
    {
      "_id": "60215b58559c124698a54219",
      "address": "localhost",
      "port": 3002,
      "status": true,
      "type": "undefined",
      "__v": 0
    },
    {
      "_id": "60215b58559c124698a5421a",
      "address": "localhost",
      "port": 3003,
      "status": true,
      "type": "undefined",
      "__v": 0
    }
  ]
}
```

## PUT /api/peer

Allows to save a peer in the database. The body of the request should contain the peer to save:

body example:

```json
{
  "peer": {
    "address": "localhost",
    "port": 3005,
    "type": "undefined"
  }
}
```

Response example:

```json
{
  "message": "Peer added",
  "peer": {
    "address": "localhost",
    "port": 3005,
    "type": "undefined"
  }
}
```

## DELETE /api/peer

Delete a peer from the database. In case no peer is found in the DB, it will return status 400.

Body example:

```json
{
  "peer": {
    "address": "localhost",
    "port": 3005,
    "type": "undefined"
  }
}
```

Response example:

1. For a deletion went well:

   ```json
   {
     "message": "Peer deleted",
     "peer": {
       "address": "localhost",
       "port": 3005,
       "type": "undefined"
     }
   }
   ```

1. For a non-existing peer:

   ```json
   {
     "message": "Peer not in DB",
     "peer": {
       "address": "localhost",
       "port": 3005,
       "type": "undefined"
     }
   }
   ```

## PUT /api/peer/discover

Check for the available peers and fetch their peers. If not already in DB, it will save them.

Response example:

1. For some peers actually discovered:

   ```json
   {
     "message": "Peers discovered",
     "peers": [
       {
         "address": "localhost",
         "port": 3005,
         "type": "undefined"
       },
       {
         "address": "localhost",
         "port": 3006,
         "type": "undefined"
       }
     ]
   }
   ```

1. For no peers discovered
   ```json
   {
     "message": "No peers discovered",
     "peers": []
   }
   ```

# Nodes

## POST /api/node/mine

This API will follow these middlewares:

```
 ┌────────────────────────────────────────┐
 │    nodeController.create_txs_pool      │
 └────────────────────────────────────────┘
                     ↓
 ┌────────────────────────────────────────┐
 │      blockController.create_block      │
 └────────────────────────────────────────┘
                     ↓
 ┌────────────────────────────────────────┐
 │      blockController.mine_block        │
 └────────────────────────────────────────┘
                     ↓
 ┌─────────────────────────────────────────┐
 │       blockController.save_block        │
 └─────────────────────────────────────────┘
                     ↓
 ┌─────────────────────────────────────────┐
 │     blockController.propatate_block     │
 └─────────────────────────────────────────┘
```

So it will:

1. Take a bunch of transactions from the pool (`transactions` collection)
1. Create a block with these transactions, where the first transaction will be from the coinbase to the address of node for the mining reward
1. Try to mine that block
1. Save the block in the blockchain
1. Propagate the block to the other peers

Response example:

1. For no peers available in the network:

```json
{
  "message": "No peers available",
  "block": {
    "header": {
      "id": 19,
      "previous_hash": "000049d3d430e41d07f00695345286c0290afc987f744c570fe770bed9d36832",
      "txs_root": "1160e731d74a70326e2a021a0af4f3c0b62ff57485ce5bbbdb46590bfe88599ae",
      "nonce": 74712,
      "difficulty": 1.7668470647783843e72,
      "timestamp": 1613228203963
    },
    "transactions": [
      ...
    ]
  }
}
```

2. For some peers available, the message might be something like:

```json
 "message": {
        "contacted": [
            "Peer: localhost:3003 has been contacted through the API: PUT /api/block",
            "Peer: localhost:3002 has been contacted through the API: PUT /api/block"
        ]
    }
```

# Blocks

## PUT /api/block

The request will traverse the following middlewares:

```json
 ┌────────────────────────────────────────┐
 │         blockController.checks         │
 └────────────────────────────────────────┘
                     ↓
 ┌────────────────────────────────────────┐
 │       blockController.save_block       │
 └────────────────────────────────────────┘
                     ↓
 ┌────────────────────────────────────────┐
 │     blockController.propagate_block    │
 └────────────────────────────────────────┘
```

- The `checks` middleware will make sure that:

  1. The node does not already have that block, namely a block with the same hash and the same id
  1. The hash satisfies the difficulty constraint
  1. The first transaction is from the coinbase
  1. The first coinbase transaction has right mining reward amount
  1. No other transaction is from the coinbase
  1. The `previous_hash` of the block, corresponds to a hash of a block in the blockchain
  1. The `previous_hash` is the hash of the last block
  1. The transactions are valid --> it will call, for each transaction, `GET /api/transaction/validation/partial` to validate that transaction

- Save the block in the blockchain (`blocks` collection) and the `(hash, id)` in the `hashes` collection.

- Propagate the block to other peers.

Response example:

```json
{
  "message": {
    "contacted": [
      "Peer: localhost:3002 has been contacted through the API: PUT /api/block",
      "Peer: localhost:3003 has been contacted through the API: PUT /api/block"
    ]
  },
  "block": {
    "header": {
      "id": 19,
      "previous_hash": "000049d3d430e41d07f00695345286c0290afc987f744c570fe770bed9d36832",
      "txs_root": "1160e731d74a70326e2a021a0af4f3c0b62ff57485ce5bbbdb46590bfe88599ae",
      "nonce": 74712,
      "difficulty": 1.7668470647783843e72,
      "timestamp": 1613230132878
    },
    "transactions": [
      ...
    ]
  }
}
```

## GET /api/block/:id

Will return the block with the given id.

Response example:

```json
{
  "message": "Block retrieved",
  "block": {
    "header": {
      "id": 12,
      "previous_hash": "000048de73083397f3821108c8efdcb195eb7daa0496ea09239dfefde59e0def",
      "txs_root": "14175095cc269b794dbcbca6fc24e3c18fd1a8acbf6934a4dc237db1e1a9270f6",
      "nonce": 25428,
      "difficulty": 1.7668470647783843e72,
      "timestamp": 1613161311779
    },
    "transactions": [
      ...
    ]
  }
}
```

## GET /api/block/last

Returns in the response the header of last block possessed by the node.

Response example:

```json
{
  "message": "Last block retrieved",
  "block": {
    "id": 19,
    "previous_hash": "000049d3d430e41d07f00695345286c0290afc987f744c570fe770bed9d36832",
    "txs_root": "1160e731d74a70326e2a021a0af4f3c0b62ff57485ce5bbbdb46590bfe88599ae",
    "nonce": 74712,
    "difficulty": 1.7668470647783843e72,
    "timestamp": 1613230132878
  }
}
```

## GET /api/block/validate

Uses the middleware `blockController.checks` (see [here](##put-/api/block)) and check whether the block is valid.

Body example:

```json
{
  "block": {
    "header": {
      "id": 19,
      "previous_hash": "000049d3d430e41d07f00695345286c0290afc987f744c570fe770bed9d36832",
      "txs_root": "1160e731d74a70326e2a021a0af4f3c0b62ff57485ce5bbbdb46590bfe88599ae",
      "nonce": 74712,
      "difficulty": 1.7668470647783843e72,
      "timestamp": 1613230132878
    },
    "transactions": [
     <transaction_1>
     <transaction_2>
     ...
    ]
  }
}
```

Response example:

```json
{
  "message": "Block valid",
  "validation": [
    {
      <transaction_1>
      "message": "Transaction valid"
    },
    {
      <transaction_2>
      "message": "Transaction valid"
    },
   ...
  ],
  "block": {
    "header": {
      "id": 19,
      "previous_hash": "000049d3d430e41d07f00695345286c0290afc987f744c570fe770bed9d36832",
      "txs_root": "1160e731d74a70326e2a021a0af4f3c0b62ff57485ce5bbbdb46590bfe88599ae",
      "nonce": 74712,
      "difficulty": 1.7668470647783843e72,
      "timestamp": 1613230132878
    },
    "transactions": [
      ...
    ]
  }
}
```
