async function sendUpdates(googleService, sheet, updates, start) {
  const startColumn = "D";
  const endColumn = "F";

  let newUpdates = updates.map((product, idx) => {
    return {
      range: `${startColumn}${start + idx}:${endColumn}${start + idx}`,
      values: [[product.quantity, product.availability, product.markup]],
    };
  });

  let request = {
    valueInputOption: "USER_ENTERED",
    resource: { data: newUpdates },
    spreadsheetId: sheet.id,
  };

  try {
    await googleService.spreadsheets.values.batchUpdate(request);
  } catch (error) {
    console.log(error);
    // create unique google spreadsheet
    const newSpreadsheetId = await createGoogleSpreadsheet(
      googleService,
      sheet.name
    );

    // add to new spreadsheet
    request.spreadsheetId = newSpreadsheetId;
    await googleService.spreadsheets.values.batchUpdate(request);

    throw {
      msg: `Write access not granted. Get new updates here: https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`,
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
