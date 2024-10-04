const express = require("express");
const db = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";

const verify = function getverification(req, res, next) {
  let header = req.headers.authorization;
  header = header.split(" ")[1];
  if (header) {
    const decoded = jwt.verify(header, secret, (err, data) => {
      if (err) {
        res.status(403).send("Forbidden");
      } else {
        req.user = data;
        next();
      }
    });
  }
};

// route.get("/applyToken", applyToken);

module.exports = verify;
