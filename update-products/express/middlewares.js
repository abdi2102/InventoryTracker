const { google } = require("googleapis");
const readProducts = require("../read/products");
const fetchProducts = require("../fetch/products");
const sendUpdates = require("../send/updates");
const path = require("path");
const fs = require("fs");

let canUpdateProducts = true;

function renderUserSpreadsheet(_, res) {
  res.render(path.join(__dirname, "../public/index.pug"));
}

async function submitUpdates(req, res, next) {
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

    // res
    //   // .status(200)
    //   .json({
    //     msg: `attempting to update. estimate completion time: ${completionTime}`,
    //   });
    const startTime = performance.now();

    for (let x = updateIterations; x > 0 && canUpdateProducts == true; x--) {
      const numProducts = x < 1 ? productCount % setCount : setCount;
      const start = (updateIterations - x) * setCount + startRow;
      const end = start + numProducts - 1;

      const productIds = await readProducts(googleService, sheet, start, end);
      const updates = await fetchProducts(productIds, updateQuery, start);

      await sendUpdates(googleService, sheet, updates, start);

      updatedProductsCount += productIds.length;

      console.log(
        `completed set ${Math.ceil(
          updateIterations - x + 1
        )}. Number sets left: ${Math.ceil(updateIterations - 1)}`
      );

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

    canUpdateProducts = true;
  } catch (error) {
    console.log("hey", error);
    next(error);
  }
}

function stopUpdates(req, res, next) {
  try {
    canUpdateProducts = false;
    res.status(200).json({ msg: "stopping updates" });
  } catch (error) {
    res.status(500).json({ msg: "oops. ran into error." });
  }
}

module.exports = { renderUserSpreadsheet, submitUpdates, stopUpdates };

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
