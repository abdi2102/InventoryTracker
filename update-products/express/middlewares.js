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

  try {
    const googleService = google.sheets({ version: "v4", auth });

    const io = req.app.get("io");

    res.status(200).json({
      msg: `attempting to update. `,
    });

    const productIds = await readProducts(
      googleService,
      sheet,
      startRow,
      updateAll == true ? 1000 : startRow + numProducts - 1
    );

    const productCount = updateAll ? productIds.length : numProducts;
    const setCount = 2;
    const updateIterations = productCount / setCount;

    for (let x = updateIterations; x > 0 && canUpdateProducts == true; x--) {
      const numProducts = x < 1 ? productCount % setCount : setCount;
      const start = (updateIterations - x) * setCount + startRow;
      const end = start + numProducts - 1;

      const productIdsSubset = productIds.slice(
        start - startRow,
        end - startRow + 1
      );

      const updates = await fetchProducts(productIdsSubset, updateQuery, start);

      await sendUpdates(googleService, sheet, updates, start);

      //   send progress updates
      const updatedProductsCount = end - startRow + 1;
      io.emit("updateProgress", (updatedProductsCount / productCount) * 100);

      if (productIds.length < numProducts) {
        break;
      }
    }

    canUpdateProducts = true;
    io.emit("updatesComplete");
  } catch (error) {
    io.emit("updatesComplete");
    console.log(error);
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
