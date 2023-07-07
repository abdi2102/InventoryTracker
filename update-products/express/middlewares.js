const { google } = require("googleapis");
const validateUpdateForm = require("../form/validate");
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
    validateUpdateForm(body);
    const googleService = google.sheets({ version: "v4", auth: oAuth });
    res.status(200).json({ msg: "success" });
    await updateProducts(io, googleService, canUpdateProducts, body);
    io.emit("updatesComplete");
  } catch (error) {
    io.emit("updatesComplete");
    next(error);
  }
}

function stopUpdates(req, res, next) {
  try {
    canUpdateProducts = false;
    res.status(200).json({ msg: "stopping updates" });
  } catch (error) {
    next({ msg: "Oops. ran into error.", code: 500 });
  }
}

module.exports = { renderUserSpreadsheet, submitUpdates, stopUpdates };
