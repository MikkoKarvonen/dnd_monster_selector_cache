require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const host = process.env.HOST;
const redis = require("redis");
const client = redis.createClient();
const fetch = require("node-fetch");

client.on("error", function (error) {
  console.error(error);
});

app.get("/api/monsters/", (req, res) => {
  client.exists("monsters", (error, exists) => {
    if (error) {
      return error;
    }
    if (exists === 0) {
      fetch(`https://www.dnd5eapi.co/api/monsters/`)
        .then((res) => res.json())
        .then((body) => {
          client.set("monsters", JSON.stringify(body.results));
          res.json(body.results);
        });
    } else {
      client.get("monsters", function (err, reply) {
        res.json(JSON.parse(reply));
      });
    }
  });
});

app.listen(port, () => {
  console.log(`${host}:${port}`);
});
