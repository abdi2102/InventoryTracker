const { google } = require("googleapis");
const readProducts = require("../read/products");
const fetchProducts = require("../fetch/products");
const sendUpdates = require("../send/updates");
const path = require("path");

function renderUserSpreadsheet(req, res) {
  res.render(path.join(__dirname, "../public/index.pug"));
}

async function submitUpdates(req, res) {
  let auth = req.oAuth2Client;
  let sheet = req.sheet;
  let options = req.options;
  try {
    const googleService = google.sheets({ version: "v4", auth });
    const productIds = await readProducts(googleService, sheet, options);

    if (productIds.length === 0) {
      throw Error(`No product id(s) found for ${sheet.sheetName}`);
    }

    const updates = await fetchProducts(productIds, options.retries);

    const updatedRows = await sendUpdates(
      googleService,
      sheet.id,
      updates,
      options.startRow
    );

    res.status(200).json({ msg: `updated rows: ${updatedRows}` });
  } catch (error) {
    console.log(error);
    if (error.message) {
      res.status(500).json({ msg: error.message });
    } else {
      res.status(500).json(error);
    }
  }
}
module.exports = { renderUserSpreadsheet, submitUpdates };
