const { google } = require("googleapis");
const joiErrorHandler = require("../joi/error");
const { updateForm } = require("../joi/form");
const { updateProducts } = require("../helpers");
const path = require("path");
let canUpdateProducts = true;

function renderUserSpreadsheet(_, res) {
  res.render(path.join(__dirname, "../public/index.pug"));
}

async function submitUpdates(req, res, next) {
  const { oAuth, body, app } = req;
  const io = app.get("io");
  canUpdateProducts = true;

  try {
    joiErrorHandler(updateForm.validate(body, { abortEarly: false }));
    const googleService = google.sheets({ version: "v4", auth: oAuth });
    await updateProducts(io, googleService, body, canUpdateProducts);
    res.status(200).json({ msg: "success" });
    io.emit("updatesComplete");
  } catch (error) {
    io.emit("updatesComplete");
    next(error);
  }
}
function stopUpdates(req, res, next) {
  try {
    canUpdateProducts = false;
    res.status(200).json({ msg: "stopped updates" });
    io.emit("updatesComplete");
  } catch (error) {
    next({ msg: "Oops. ran into error.", code: 500 });
  }
}

module.exports = { renderUserSpreadsheet, submitUpdates, stopUpdates };
