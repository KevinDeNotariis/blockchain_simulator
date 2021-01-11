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

## How to Run the simulation

- Clone the Repo;

- Enter the folder;

- Type

  ```
  npm run dev
  ```

  to start the server;

- Navigate to http://localhost:3000 and enjoy!
