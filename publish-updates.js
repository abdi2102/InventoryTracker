const readProducts = require("./read-products");
const fetchProducts = require("./fetch-products");
const sendUpdates = require("./send-updates");
const { google } = require("googleapis");

async function publishUpdates(auth, sheet, options) {
  if (auth === undefined) {
    throw Error("not authorized");
  }

  const googleService = google.sheets({ version: "v4", auth });

  try {
    const productIds = await readProducts(googleService, sheet, options);

    if (productIds.length === 0) {
      throw Error(`No product id(s) found for ${sheet.sheetName}`);
    }

    const updates = await fetchProducts(productIds);

    await sendUpdates(googleService, sheet.id, updates, options.startRow);

    if (updates.length < options.numProducts) {
      throw Error("browser got caught. try again later.");
    }

    return `updated rows: ${updates.length}`;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = publishUpdates;
