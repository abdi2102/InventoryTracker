async function readProducts(googleService, sheet, start, end) {
  const sheetName = sheet.name !== undefined ? `${sheet.name}!` : "";
  let productIdColumn = "J";
  try {
    const {
      data: { values },
    } = await googleService.spreadsheets.values.get({
      spreadsheetId: sheet.id,
      range: `${sheetName}${productIdColumn}${start}:${productIdColumn}${end}`,
    });
    return values || [];
  } catch (error) {
    if (error.code) {
      switch (error.code) {
        case 404:
          throw { msg: `${sheetName} not found`, code: 404 };
        default:
          throw { msg: "request not valid", code: error.code };
      }
    } else {
      throw { msg: "unexpected server error", code: 500 };
    }
  }
}

module.exports = readProducts;
