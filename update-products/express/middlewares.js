const { google } = require("googleapis");
const readProducts = require("../read/products");
const fetchProducts = require("../fetch/products");
const sendUpdates = require("../send/updates");
const path = require("path");
const { performance } = require("perf_hooks");
const fs = require("fs");

function renderUserSpreadsheet(_, res) {
  res.render(path.join(__dirname, "../public/index.pug"));
}

async function submitUpdates(req, res) {
  const { oAuth2Client: auth, updateQuery, sheet } = req;
  const {
    numProducts,
    startRow,
    custom: { updateAll },
  } = updateQuery;

  const productCount = updateAll ? 400 : numProducts;

  const setCount = 25;
  const updateIterations = productCount / setCount;

  let updatedProductsCount = 0;

  try {
    const googleService = google.sheets({ version: "v4", auth });

    const completionTime = estimateCompletionTime();

    if (updateAll) {
      res.status(200).json({ msg: `Attempting To Update.` });
    } else {
      res.status(200).json({
        msg: ` Completion Time: ${
          isNaN(completionTime) === false
            ? `${completionTime * numProducts} min.`
            : "Unable To Estimate"
        } `,
      });
    }

    const startTime = performance.now();

    for (let x = updateIterations; x > 0; x--) {
      const numProducts = x < 1 ? productCount % setCount : setCount;
      const start = (updateIterations - x) * setCount + startRow;
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

    saveUpdateStats({
      date: new Date().toLocaleDateString(),
      merchant: updateQuery.merchant,
      productCount: updatedProductsCount,
      completionTime: Math.round(((endTime - startTime) / 60000) * 10) / 10,
    });
  } catch (error) {
    console.log(error);
    if (error.message) {
      res.status(400).json({ msg: error.message });
    } else {
      res.status(500).json(error);
    }
  }
}

module.exports = { renderUserSpreadsheet, submitUpdates };

function saveUpdateStats(stat) {
  try {
    // READING FILE
    let existingStats = [];

    if (fs.existsSync("update-stats.json")) {
      existingStats = fs.readFileSync("update-stats.json", {
        encoding: "utf-8",
      });

      if (existingStats.length !== 0) {
        existingStats = JSON.parse(existingStats);
      }
    }

    if (existingStats.length > 14) {
      existingStats.pop();
    }

    const newStats = JSON.stringify([stat].concat(existingStats));
    fs.writeFileSync("update-stats.json", newStats);
  } catch (error) {
    console.log("Unable To Save Stats");
    return;
  }
}

function estimateCompletionTime() {
  try {
    if (fs.existsSync("update-stats.json")) {
      const completedQueries = JSON.parse(fs.readFileSync("update-stats.json"));

      if (completedQueries instanceof Array) {
        const completionTimes = completedQueries.map(
          (query) => query.completionTime / query.productCount
        );

        return completionTimes.reduce((a, b) => a + b) / completionTimes.length;
      }
    }
    return;
  } catch (error) {
    return;
  }
}
