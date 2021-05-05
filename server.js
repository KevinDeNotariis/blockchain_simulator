const { fork, spawn, exec } = require("child_process");

const nodes = [
  fork("./app", ["0"]),
  fork("./app", ["1"]),
  fork("./app", ["2"]),
];
