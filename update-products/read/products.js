async function readProducts(googleService, sheet, start, numProducts) {
  const sheetName = sheet.name !== undefined ? `${sheet.name}!` : "";
  let productIdColumn = "J";
  try {
    const {
      data: { values },
    } = await googleService.spreadsheets.values.get({
      spreadsheetId: sheet.id,
      range: `${sheetName}${productIdColumn}${start}:${productIdColumn}${
        start + (numProducts - 1)
      }`,
    });
    return values || [];
  } catch (error) {
    console.log(error);
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
