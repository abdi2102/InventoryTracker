const { isValidUrl } = require("./appHelpers");

function checkGoogleSheetsAccess(req, res, next) {
  res.local("spreadsheetLink", req.body.spreadsheetLink);

  // return array of permissions e.g. ["read", "write"]
  next();
}

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

  req.spreadsheet = {
    startRow,
    numProducts,
    id: spreadsheetLink.match("/d/([a-zA-Z0-9-_]+)")[1],
  };
  next();
}

module.exports = { validateForm, checkGoogleSheetsAccess };
