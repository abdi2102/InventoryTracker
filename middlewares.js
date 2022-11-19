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
  let startRow = parseInt(req.body.startRow);
  let numProducts = parseInt(req.body.numProducts);
  const spreadsheetLink = req.body.spreadsheetLink;
  const sheetName = req.body.sheetName;

  if (isNaN(startRow) || startRow < 1) {
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

  let spreadsheet = new Spreadsheet(spreadsheetLink, sheetName);
  spreadsheet.getId();

  req.spreadsheet = spreadsheet;

  // limit products that can be updated at once to 50 at once
  numProducts = Math.min(numProducts, 50);

  req.options = { startRow, numProducts };
  next();
}

module.exports = { validateForm };
