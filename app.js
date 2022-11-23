require("dotenv").config();
const { authorize, getGmailUserInfo } = require("./auth");
const publishUpdates = require("./publish-updates");
const { validateForm } = require("./validate-form");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();
app.use(cookieParser());
app.use(express.json());
app.set("view engine", "pug");
app.use(
  session({
    resave: true,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
  })
);

app.use("/user/spreadsheet", authorize);

app.get("/user/spreadsheet/", (req, res) => {
  res.render("index");
});

app.patch("/user/spreadsheet", validateForm, async (req, res) => {
  try {
    // update parameters for publishUpdates
    const msg = await publishUpdates(req.oAuth2Client, req.sheet, req.options);
    res.send({ msg }).status(200);
  } catch (error) {
    if (error.message) {
      res.send({ msg: error.message }).status(500);
    } else {
      res.send(error).status(200);
    }
  }
});

app.get("/get/gmail/user", async (req, res) => {
  try {
    await getGmailUserInfo(req, res);

    const redirectTo = req.session.redirectTo || "";
    delete req.session.redirectTo;

    res.redirect(redirectTo);
  } catch (error) {
    res.send({ msg: error.message });
  }
});

module.exports = app;
