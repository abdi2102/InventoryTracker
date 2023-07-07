const readProducts = require("../update-products/read/products");
const fetchProducts = require("../update-products/fetch/products");
const sendUpdates = require("../update-products/send/updates");

// async function updateProducts(io, googleService, body) {
//   try {
//     const {
//       updateOptions: { startRow, retries },
//       productsToUpdate: { updateAll, numProducts },
//     } = body;

//     const sheet = { ...body.sheet, id: getSheetId(body.sheet.link) };
//     const productIds = await readProducts(
//       googleService,
//       sheet,
//       startRow,
//       updateAll == true ? 500 : startRow + numProducts - 1
//     );

//     const productCount = updateAll ? productIds.length : numProducts;
//     const setCount = 20;
//     const updateIterations = productCount / setCount;

//     for (let x = updateIterations; x > 0 && canUpdateProducts == true; x--) {
//       const numProducts = x < 1 ? productCount % setCount : setCount;
//       const start = (updateIterations - x) * setCount + startRow;
//       const end = start + numProducts - 1;

//       const productIdsSubset = productIds.slice(
//         start - startRow,
//         end - startRow + 1
//       );

//       const updates = await fetchProducts(
//         productIdsSubset,
//         (allowRetries = retries)
//       );
//       await sendUpdates(googleService, sheet, updates, start);

//       // send progress updates
//       const updatedProductsCount = end - startRow + 1;
//       io.emit("updateProgress", (updatedProductsCount / productCount) * 100);
//     }
//   } catch (error) {
//     console.log(error);
//     throw { msg: "unable to update products", code: 500 };
//   }
// }

async function updateProducts(io, googleService, canUpdateProducts, body) {
  try {
    const {
      updateOptions: { startRow, retries },
      productsToUpdate: { updateAll, numProducts },
    } = body;

    const sheet = { ...body.sheet, id: getSheetId(body.sheet.link) };
    const productIds = await readProducts(
      googleService,
      sheet,
      startRow,
      updateAll == true ? 500 : startRow + numProducts - 1
    );

    const productCount = updateAll ? productIds.length : numProducts;
    const setCount = 25;
    const updateIterations = productCount / setCount;

    for (let x = updateIterations; x > 0 && canUpdateProducts == true; x--) {
      const numProducts = x < 1 ? productCount % setCount : setCount;
      const start = (updateIterations - x) * setCount + startRow;
      const end = start + numProducts - 1;

      const productIdsSubset = productIds.slice(
        start - startRow,
        end - startRow + 1
      );

      const updates = await fetchProducts(
        productIdsSubset,
        (allowRetries = retries)
      );
      await sendUpdates(googleService, sheet, updates, start);

      // send progress updates
      const updatedProductsCount = end - startRow + 1;
      io.emit("updateProgress", (updatedProductsCount / productCount) * 100);
    }
  } catch (error) {
    throw error
  }
}

function getSheetId(sheetLink) {
  try {
    return sheetLink.match("/d/([a-zA-Z0-9-_]+)")[1];
  } catch (error) {
    throw { msg: "link not valid", code: 400 };
  }
}

module.exports = { updateProducts, getSheetId };
