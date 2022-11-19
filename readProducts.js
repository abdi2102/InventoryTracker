async function readProducts(googleService, spreadsheet, options) {
  let asinColumn = "J";

  if (isNaN(options.numProducts)) {
    throw Error("number of products field is not valid");
  }

  let lastRow = options.startRow + options.numProducts - 1;
  let end = `${asinColumn}${lastRow}`;
  if (lastRow < options.startRow) {
    throw Error("At least one product needs to be updated");
  }

  try {
    const {
      data: { values },
    } = await googleService.spreadsheets.values.get({
      spreadsheetId: spreadsheet.id,
      range: `${asinColumn}${options.startRow}:${end}`,
    });

    if (values == undefined) {
      throw Error(`No product id(s) found for ${spreadsheet.sheetName}`);
    }

    return values;
  } catch (error) {
    throw error;
  }
}

module.exports = readProducts;
