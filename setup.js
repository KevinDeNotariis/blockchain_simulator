const http = require("http");
const qs = require("qs");
const mongoose = require("mongoose");

const UserSchema = require("./models/userModel");
const User = mongoose.model("User", UserSchema);

const generate_users = () => {
  const param = qs.stringify({ num_users: 20 });
  const options = {
    host: "localhost",
    path: "/users/generate_bunch_of_users",
    port: "3000",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  let data = "";
  const request = http.request(options, (response) => {
    response.on("data", (chunk) => {
      data += chunk.toString("utf-8");
    });
    response.readableEnded("end", () => {
      let users = JSON.parse(data);
      users.map((user) => {
        const user = new User(user);
        user.save((err, doc) => {
          if (err) {
            console.log("ERROR SAVING USER");
          } else {
            console.log(doc);
          }
        });
      });
    });
  });

  request.write(param);
  request.end();
};
