const http = require("http");

const propagate_to_peers = (peers, post_data, api, method) => {
  let return_str = "";
  for (i in peers) {
    if (!peers[i].status) continue;
    const options = {
      host: peers[i].address,
      port: peers[i].port,
      path: api,
      method: method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data),
      },
    };

    let str = "";

    const request = http.request(options, (response) => {
      response.on("data", (chunk) => {
        str += chunk.toString("utf-8");
      });
      response.on("end", () => {});
    });
    request.write(post_data);
    return_str += `Peer: ${peers[i].address}:${peers[i].port} has been contacted through the API: ${api}\n`;
    request.end();
  }

  return return_str;
};

module.exports = { propagate_to_peers };
