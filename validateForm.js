const Sheet = require("./classes/sheet");

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
  const sheetLink = req.body.sheetLink;
  const sheetName = req.body.sheetName;

  if (isNaN(startRow) || startRow < 1) {
    res.send({ msg: "please enter a valid start" });
    return;
  }

  if (isNaN(numProducts) || numProducts < 1) {
    res.send({ msg: "please update at least one product" });
    return;
  }

  if (isValidUrl(sheetLink) === false) {
    res.send({ msg: "please enter a valid url" });
    return;
  }

  let sheet = new Sheet(sheetLink, sheetName);
  sheet.getId();

  req.sheet = sheet;

  // limit products that can be updated at once to 50 at once
  numProducts = Math.min(numProducts, 50);

  req.options = { startRow, numProducts };
  next();
}

module.exports = { validateForm };
