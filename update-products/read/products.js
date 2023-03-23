
async function readProducts(googleService, sheet, start, end) {
  const sheetName = sheet.sheetName !== undefined ? `${sheet.sheetName}!` : "";
  let productIdColumn;

  switch (sheet.template) {
    case "fbShops":
      productIdColumn = "J";
      break;
    default:
      throw Error("sheet template not recognized");
  }

  try {
    const {
      data: { values },
    } = await googleService.spreadsheets.values.get({
      spreadsheetId: sheet.getId(),
      range: `${sheetName}${productIdColumn}${start}:${productIdColumn}${end}`,
    });
    return values || [];
  } catch (error) {
    throw error;
  }
}

module.exports = readProducts;
