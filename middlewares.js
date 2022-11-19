const Spreadsheet = require("./classes/spreadsheet");

const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

function validateForm(req, res, next) {
  const startRow = parseInt(req.body.startRow);
  const numProducts = parseInt(req.body.numProducts);
  const spreadsheetLink = req.body.spreadsheetLink;

  if (isNaN(startRow)) {
    res.send({ msg: "please enter a valid start" });
    return;
  }

  if (isNaN(numProducts) || numProducts < 1) {
    res.send({ msg: "please update at least one product" });
    return;
  }

  if (isValidUrl(spreadsheetLink) === false) {
    res.send({ msg: "please enter a valid url" });
    return;
  }

  let spreadsheet = new Spreadsheet(spreadsheetLink);
  spreadsheet.getId();

  req.spreadsheet = spreadsheet;

  req.options = { startRow, numProducts };
  next();
}

module.exports = { validateForm };
