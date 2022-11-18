const readProducts = require("./readProducts");
const fetchProducts = require("./fetchProducts");
const sendUpdates = require("./sendUpdates");
const { google } = require("googleapis");

async function publishUpdates(auth, spreadsheet) {
  if (auth === undefined) {
    throw Error("not authorized");
  }

  const googleService = google.sheets({ version: "v4", auth });

  try {
    const productIds = await readProducts(googleService, spreadsheet);
    const updates = await fetchProducts(productIds);

    await sendUpdates(
      googleService,
      spreadsheet.id,
      updates,
      spreadsheet.startRow
    );

    if (updates.length < spreadsheet.numProducts) {
      throw Error("browser got caught. try again later.");
    }

    return `updated rows: ${updates.length}`;
  } catch (error) {
    throw error;
  }
}

module.exports = publishUpdates;
