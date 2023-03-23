require("dotenv").config();
const { getGmailUserInfoAndRedirect } = require("../auth/google");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
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

app.use("/user/spreadsheet", userSpreadsheetsRouter);
app.get("/gmail/user", getGmailUserInfoAndRedirect);
app.get("*", (req, res) =>
  res.render(path.join(__dirname, "../update-products/public/404.pug"))
);

module.exports = app;
