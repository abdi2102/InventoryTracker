require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    resave: true,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
  })
);

app.set("view engine", "pug");
app.listen(3000);

const { authorize, getGmailUserInfo } = require("./auth");
const publishUpdates = require("./publishUpdates");

const { validateForm } = require("./validateForm");

app.use("/user/spreadsheet", authorize);

app.get("/user/spreadsheet/", (req, res) => {
  res.render("index");
});

app.patch("/user/spreadsheet", validateForm, async (req, res) => {
  try {
    // update parameters for publishUpdates
    const msg = await publishUpdates(
      req.oAuth2Client,
      req.sheet,
      req.options
    );
    res.send({ msg });
  } catch (error) {
    if (error.message) {
      res.send({ msg: error.message });
    } else {
      res.send(error);
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
