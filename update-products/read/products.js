async function readProducts(googleService, sheet, start, end) {
  const sheetName = sheet.sheetName !== undefined ? `${sheet.sheetName}!` : "";
  let productIdColumn;

  switch (sheet.template) {
    case "fbShops":
      productIdColumn = "J";
      break;
    default:
      throw { msg: "sheet template not recognized", code: 400 };
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
    console.log(error);
    if (error.code) {
      switch (error.code) {
        case 404:
          throw { msg: `${sheetName} not found`, code: 404 };
        default:
          throw { msg: "request not valid", code: 400 };
      }
    } else {
      throw error;
    }
  }
}

module.exports = readProducts;
