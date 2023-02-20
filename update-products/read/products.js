async function readProducts(googleService, sheet, updateQuery) {
  const { startRow, numProducts, custom } = updateQuery;
  const sheetName = sheet.sheetName !== undefined ? `${sheet.sheetName}!` : "";
  let partialRange;
  let productIdColumn;

  switch (sheet.template) {
    case "fbShops":
      productIdColumn = "J";
      break;
    default:
      throw Error("sheet template not recognized");
  }

  if (custom.includes("updateAll") === false) {
    let lastRow = startRow + numProducts - 1;
    let end = `${productIdColumn}${lastRow}`;

    partialRange = `${sheetName}${productIdColumn}${startRow}:${end}`;
  }

  try {
    const {
      data: { values },
    } = await googleService.spreadsheets.values.get({
      spreadsheetId: sheet.getId(),
      range: custom.includes("updateAll")
        ? `${sheetName}${productIdColumn}:${productIdColumn}`
        : partialRange,
    });
    return values || [];
  } catch (error) {
    throw error;
  }
}

module.exports = readProducts;
