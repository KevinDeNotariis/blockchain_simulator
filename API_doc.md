# Table of contents

1. [Transactions](#transactions)
   1. [POST /transaction](#post-/transaction)
   1. [PUT /transaction](#post-/transaction)
   1. [GET /transaction/from_peer](#/transaction/from_peer)
   1. [GET /transaction/from_all_peers](#/transactionfrom_all_peers)

# Transactions

## POST /transaction

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
│ transactionController.validate_transaction  │
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

| Middleware                                 | Steps (in this sequence)                                                                                                                                                | Return if not passed                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| userController.generate_transaction        | Check whether the `sender_private_key` is really what it claims to be (namely it will check that the public key generated using the private key coincide with `sender`) | Status 400 with "message": "Keys do not correspond"          |
| userController.generate_transaction        | Sign it                                                                                                                                                                 |                                                              |
| transactionController.validate_transaction | Check whether the signature is valid (it should, since the node itself signed it, but this part is in a common `validate_transaction` middleware)                       | Status 400 with "message": "Transaction is not valid"        |
| transactionController.validate_transaction | Check whether the node has already the transaction in the pool                                                                                                          | Status 400 with "message": "Transaction already in the pool" |
| transactionController.validate_transaction | Check whether the node has already the transaction validated in a block                                                                                                 | Status 400 with "message": "Transaction already in a block"  |
| transactionController.validate_transaction | Check whether the sender has sufficient funds                                                                                                                           | Status 400 with "message": "Sender has not enough funds"     |

If everything is fine, it will save the transaction in the transaction pool (in the `transactions` collection) and the response should be the final saved transaction, with a message saying that eveything is fine:

```json
{
  "message": "Transaction added",
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
