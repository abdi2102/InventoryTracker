require("dotenv").config();
const { getGmailUserInfoAndRedirect } = require("../auth/google");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = require("express")();

const http = require("http")
const server = http.createServer(app);

app.use(cookieParser());
app.use(express.json());
app.set("view engine", "pug");
const session = require("express-session");
const userSpreadsheetsRouter = require("../update-products/express/router");
const path = require("path");
app.use(
  session({
    resave: true,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
  })
);

app.use("/user/spreadsheet/", userSpreadsheetsRouter);
app.get("/gmail/user", getGmailUserInfoAndRedirect);
app.get("*", (req, res) =>
  res.render(path.join(__dirname, "../update-products/public/404.pug"))
);

app.use((err, req, res, next) => {
  try {
    if (err.msg) {
      res.status(err.code).json({ msg: err.msg });
    } else {
      res.status(500).json({ msg: err });
    }
  } catch (error) {
    res.status(500).end({ msg: error });
  }
});

module.exports = server;
