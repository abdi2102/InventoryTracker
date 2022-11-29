require("dotenv").config();
const { getGmailUserInfoAndRedirect } = require("../auth/google");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
app.use(express.json());
app.set("view engine", "pug");
const session = require("express-session");
const path = require("path");
const userSpreadsheetsRouter = require("../update-products/express/router");
app.use(
  session({
    resave: true,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
  })
);

app.use("/user/spreadsheet", userSpreadsheetsRouter);
app.get("/gmail/user", getGmailUserInfoAndRedirect);

module.exports = app;
