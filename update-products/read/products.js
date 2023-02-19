const numProductsNotValid = require("./read-errors");

// TODO: READ OUT OF STOCK STATUS
async function readProducts(googleService, sheet, options) {
  const { startRow, numProducts, custom } = options;
  const asinColumn = "J";
  let partialRange;
  let sheetName = sheet.sheetName !== undefined ? `${sheet.sheetName}!` : "";

  if (custom.includes("updateAll") === false) {
    if (isNaN(numProducts) || numProducts < 1) {
      throw Error(numProductsNotValid);
    }

    let lastRow = startRow + numProducts - 1;
    let end = `${asinColumn}${lastRow}`;

    partialRange = `${sheetName}${asinColumn}${startRow}:${end}`;
  }

  try {
    const {
      data: { values },
    } = await googleService.spreadsheets.values.get({
      spreadsheetId: sheet.id,
      range: custom.includes("updateAll")
        ? `${sheetName}${asinColumn}:${asinColumn}`
        : partialRange,
    });

    return values || [];
  } catch (error) {
    throw error;
  }
}

module.exports = readProducts;
