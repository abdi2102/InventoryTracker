const { google } = require("googleapis");
const readProducts = require("../read/products");
const fetchProducts = require("../fetch/products");
const sendUpdates = require("../send/updates");
const path = require("path");
let canUpdateProducts = true;

function renderUserSpreadsheet(_, res) {
  res.render(path.join(__dirname, "../public/index.pug"));
}

async function updateProducts(io, googleService, validatedForm) {
  try {
    const {
      updateOptions: { updateAll, startRow, numProducts },
    } = validatedForm;

    const sheet = {
      sheetLink: validatedForm.sheetLink,
      sheetName: validatedForm.sheetName,
      id: getSheetId(validatedForm.sheetLink),
      template: validatedForm.template,
      merchant: validatedForm.merchant,
    };

    const productIds = await readProducts(
      googleService,
      sheet,
      startRow,
      updateAll == true ? 500 : startRow + numProducts - 1
    );

    const productCount = updateAll ? productIds.length : numProducts;
    const setCount = 20;
    const updateIterations = productCount / setCount;

    for (let x = updateIterations; x > 0 && canUpdateProducts == true; x--) {
      const numProducts = x < 1 ? productCount % setCount : setCount;
      const start = (updateIterations - x) * setCount + startRow;
      const end = start + numProducts - 1;

      const productIdsSubset = productIds.slice(
        start - startRow,
        end - startRow + 1
      );

      const updates = await fetchProducts(productIdsSubset, validatedForm);

      await sendUpdates(googleService, sheet, updates, start);

      // send progress updates
      const updatedProductsCount = end - startRow + 1;
      io.emit("updateProgress", (updatedProductsCount / productCount) * 100);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

function getSheetId(sheetLink) {
  try {
    return sheetLink.match("/d/([a-zA-Z0-9-_]+)")[1];
  } catch (error) {
    throw { msg: "link not valid", code: 400 };
  }
}

async function submitUpdates(req, res, next) {
  const { oAuth, validatedForm } = req;
  const io = req.app.get("io");

  try {
    res.status(200).json({ msg: "success", code: 200 });

    const googleService = google.sheets({ version: "v4", auth: oAuth });
    await updateProducts(io, googleService, validatedForm);
    canUpdateProducts = true;
    io.emit("updatesComplete");
  } catch (error) {
    io.emit("updatesComplete");
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
