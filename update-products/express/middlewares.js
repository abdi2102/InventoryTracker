const { google } = require("googleapis");
const readProducts = require("../read/products");
const fetchProducts = require("../fetch/products");
const sendUpdates = require("../send/updates");
const path = require("path");
const process = require("process");
const { performance } = require("perf_hooks");

function renderUserSpreadsheet(_, res) {
  res.render(path.join(__dirname, "../public/index.pug"));
}

function stopProductUpdates(req, res) {
  try {
    console.log(process.pid);
    res.status(200).send({});
  } catch (error) {
    console.log(error);
  }
}

async function submitUpdates(req, res) {
  const { oAuth2Client: auth, updateQuery, sheet } = req;

  const productCount = updateQuery.custom.includes("updateAll")
    ? 500
    : updateQuery.numProducts;

  const setCount = 25;
  const updateIterations = productCount / setCount;

  let updatedProductsCount = 0;

  try {
    res.status(200).json({
      msg: `attempting to update products`,
    });
    const googleService = google.sheets({ version: "v4", auth });

    const startTime = performance.now();
    for (let x = updateIterations; x > 0; x--) {
      const numProducts = x < 1 ? productCount % setCount : setCount;
      const start = (updateIterations - x) * setCount + updateQuery.startRow;
      const end = start + numProducts - 1;

      const productIds = await readProducts(googleService, sheet, start, end);

      const updates = await fetchProducts(productIds, updateQuery, start);

      await sendUpdates(googleService, sheet, updates, start);

      updatedProductsCount += productIds.length;
      if (productIds.length < numProducts) {
        break;
      }
    }
    const endTime = performance.now();

    console.log(
      `updated ${updatedProductsCount} ${sheet.sheetName} products in ${
        Math.round(((endTime - startTime) / 60000) * 10) / 10
      } minutes`
    );
  } catch (error) {
    console.log(error);
    if (error.message) {
      res.status(400).json({ msg: error.message });
    } else {
      res.status(500).json(error);
    }
  }
}

module.exports = { renderUserSpreadsheet, submitUpdates, stopProductUpdates };
