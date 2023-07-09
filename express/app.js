require("dotenv").config();
const {
  getGmailUserInfoAndRedirect,
  googleLogin,
} = require("../auth/middlewares");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = require("express")();
const server = require("http").createServer(app);

// socket io
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A client connected.");
});

app.set("io", io);

// socket io

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
const { auth } = require("../auth/middlewares");
app.use("/user/spreadsheet/", auth);
app.use("/user/spreadsheet/", userSpreadsheetsRouter);
app.get("/gmail/user", getGmailUserInfoAndRedirect);

// login //

app.get("/login", (req, res) =>
  res.render(path.join(__dirname, "../public/login/index.pug"))
);

app.post("/login/google", googleLogin);
// login //

app.get("*", (req, res) =>
  res.render(path.join(__dirname, "../public/404/index.pug"))
);

// global err handling
app.use((err, req, res, next) => {
  try {
    if (err.msg) {
      res.status(err.code).json({ msg: err.msg });
    } else {
      res.status(500).json({ msg: err });
    }
  } catch (error) {
    res.status(500).end({ msg: "Unexpected server error." });
  }
});
module.exports = server;
