// TODO: ACCOUNT FOR TEMPLATE

async function sendUpdates(googleService, sheet, updates, startRow) {
  const startColumn = "D";
  const endColumn = "F";

  let newUpdates = updates.map((product, idx) => {
    return {
      range: `${startColumn}${startRow + idx}:${endColumn}${startRow + idx}`,
      values: [[product.quantity, product.availability, product.markup]],
    };
  });

  let request = {
    valueInputOption: "USER_ENTERED",
    resource: { data: newUpdates },
  };

  try {
    request.spreadsheetId = sheet.getId();
    await googleService.spreadsheets.values.batchUpdate(request);
  } catch (error) {
    // create unique google spreadsheet
    const newSpreadsheetId = await createGoogleSpreadsheet(
      googleService,
      sheet.sheetName
    );

    // add to new spreadsheet
    request.spreadsheetId = newSpreadsheetId;
    await googleService.spreadsheets.values.batchUpdate(request);

    throw {
      msg: `Write Access Not Granted. Get New Updates Here: https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`,
      code: 400,
    };
  }
}

async function createGoogleSpreadsheet(googleService, title) {
  try {
    const rndInt = Math.floor(Math.random() * 1000) + 1;

    const spreadsheet = await googleService.spreadsheets.create({
      resource: {
        properties: {
          title: `${title}_${rndInt}`,
        },
      },
      fields: "spreadsheetId",
    });
    return spreadsheet.data.spreadsheetId;
  } catch (error) {
    console.log(error);
    throw Error("Could Not Send Updates To Google");
  }
}

module.exports = sendUpdates;
