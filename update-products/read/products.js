const numProductsNotValid = require("./read-errors");

async function readProducts(googleService, sheet, options) {
  let asinColumn = "J";

  let numProducts = options.numProducts;
  let startRow = options.startRow;

  if (isNaN(numProducts) || numProducts < 1) {
    throw Error(numProductsNotValid);
  }

  let lastRow = startRow + numProducts - 1;
  let end = `${asinColumn}${lastRow}`;

  try {
    const {
      data: { values },
    } = await googleService.spreadsheets.values.get({
      spreadsheetId: sheet.id,
      range: `${asinColumn}${options.startRow}:${end}`,
    });

    return values || [];
  } catch (error) {
    throw error;
  }
}

module.exports = readProducts;
