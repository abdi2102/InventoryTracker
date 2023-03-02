const fs = require("fs");
const path = require("path");
const unpublishedUpdatesFile = path.join(
  __dirname,
  "../unpublished-updates.json"
);

// TODO: ACCOUNT FOR TEMPLATE

async function sendUpdates(googleService, sheet, updates, startRow) {
  const startColumn = "C";
  const endColumn = "E";

  let unpublishedUpdates = {};
  let totalUpdates = [];

  if (fs.existsSync(unpublishedUpdatesFile) === true) {
    let content = fs.readFileSync(unpublishedUpdatesFile, "utf8");

    if (content.length > 0) {
      unpublishedUpdates = JSON.parse(content);
    }
  }

  if (unpublishedUpdates[sheet.sheetName]) {
    totalUpdates = totalUpdates.concat(unpublishedUpdates[sheet.sheetName]);
  }

  let newUpdates = updates.map((product, idx) => {
    return {
      range: `${startColumn}${startRow + idx}:${endColumn}${startRow + idx}`,
      values: [[product.quantity, product.availability, product.markup]],
    };
  });

  totalUpdates = totalUpdates.concat(newUpdates);

  const request = {
    spreadsheetId: sheet.getId(),
    valueInputOption: "USER_ENTERED",
    resource: { data: totalUpdates },
  };

  try {
    await googleService.spreadsheets.values.batchUpdate(request);
    if (totalUpdates.length > newUpdates.length) {
      fs.writeFileSync(unpublishedUpdatesFile, "");
    }
  } catch (error) {
    if (fs.existsSync(unpublishedUpdatesFile) === false) {
      fs.appendFileSync(unpublishedUpdatesFile, "");
    }

    fs.readFile(unpublishedUpdatesFile, "utf8", (error, data) => {
      if (error) {
        return console.log(error);
      }

      let unpublishedUpdates;

      try {
        unpublishedUpdates = JSON.parse(data);
      } catch {
        unpublishedUpdates = {};
      }

      if (typeof unpublishedUpdates === "object") {
        unpublishedUpdates[sheet.sheetName] = totalUpdates;
      }

      fs.writeFile(
        unpublishedUpdatesFile,
        JSON.stringify(unpublishedUpdates),
        () => {}
      );
    });

    throw new Error("Unable To Publish Updates");
  }
}

module.exports = sendUpdates;
