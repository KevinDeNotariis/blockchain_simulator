/*
const { Transaction, Block } = require("./Block");
const fs = require("fs");

const generate_transactions = () => {
  const transactions = [
    new Transaction("Kev", "Gio", 200),
    new Transaction("Kev", "Teo", 2300),
    new Transaction("Teo", "Manu", 345),
    new Transaction("Kev", "Mirco", 1200),
    new Transaction("Mirco", "Gio", 20043),
    new Transaction("Gio", "Kev", 200),
    new Transaction("Manu", "Kev", 4200),
    new Transaction("Kev", "Gio", 32),
  ];

  const str = JSON.stringify(transactions);

  fs.writeFileSync("transactions.json", str, "utf-8");
};

const generate_blocks = () => {
  const transactions = JSON.parse(fs.readFileSync("transactions.json"));
  const blocks = [
    new Block(0, 0, [transactions[0], transactions[1], transactions[3]]),
    new Block(1, 0, [transactions[2], transactions[7]]),
    new Block(2, 0, [transactions[5]]),
    new Block(3, 0, [transactions[6], transactions[4], transactions[1]]),
    new Block(4, 0, [transactions[5]]),
    new Block(5, 0, [transactions[2], transactions[4]]),
    new Block(6, 0, [transactions[0], transactions[7], transactions[6]]),
  ];

  const str = JSON.stringify(blocks);

  fs.writeFileSync("blocks.json", str, "utf-8");
};
*/
