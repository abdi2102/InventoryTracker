const fs = require("fs");
const path = require("path");
const existingUpdatesFile = path.join(__dirname, "../unpublished-updates.json");

async function sendUpdates(googleService, spreadsheetId, updates, startRow) {
  let startColumn = "C";
  let endColumn = "E";

  let existingUpdates = [];

  // TODO: check if updates are  NULL OR INVALID TYPE
  // TODO: MONITOR OUT OF STOCK

  if (fs.existsSync(existingUpdatesFile) === true) {
    let content = fs.readFileSync(existingUpdatesFile, "utf8");

    if (content.length > 0) {
      existingUpdates = JSON.parse(content);
    }
  }

  let newUpdates = updates.map((product, idx) => {
    return {
      range: `${startColumn}${startRow + idx}:${endColumn}${startRow + idx}`,
      values: [[product.quantity, product.availability, product.markup]],
    };
  });

  const totalUpdates = existingUpdates.concat(newUpdates);
  const request = {
    spreadsheetId,
    valueInputOption: "USER_ENTERED",
    resource: { data: totalUpdates },
  };

  try {
    const response = await googleService.spreadsheets.values.batchUpdate(
      request
    );
    return response.data.totalUpdatedRows;
  } catch (error) {
    if (fs.existsSync(existingUpdatesFile) === false) {
      fs.appendFileSync(existingUpdatesFile, "");
    }

    fs.readFile(existingUpdatesFile, "utf8", (error, data) => {
      if (error) {
        return console.log(error);
      }

      let existingUpdates;
      if (data.length === 0) {
        existingUpdates = [].concat(newUpdates);
      } else {
        existingUpdates = totalUpdates;
      }

      fs.writeFile(
        existingUpdatesFile,
        JSON.stringify(existingUpdates),
        () => {}
      );
    });

    throw error;
  }
}

module.exports = sendUpdates;
