require("dotenv").config();
const express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());
const port = process.env.PORT;
const host = process.env.HOST;
const redis = require("redis");
const client = redis.createClient();
const fetch = require("node-fetch");

client.on("error", function (error) {
  console.error(error);
});

app.get("/api/monsters/:id", (req, res) => {
  const param = req.params.id;
  client.exists(param, (error, exists) => {
    if (error) {
      return error;
    }
    if (exists === 0) {
      fetch(`https://www.dnd5eapi.co/api/monsters/${param}`)
        .then((res) => res.json())
        .then((body) => {
          client.set(param, JSON.stringify(body));
          res.json(body);
        });
    } else {
      client.get(param, function (err, reply) {
        res.json(JSON.parse(reply));
      });
    }
  });
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
