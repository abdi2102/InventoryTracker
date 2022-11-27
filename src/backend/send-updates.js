
async function sendUpdates(googleService, spreadsheetId, updates, startRow) {
  let startColumn = "C";
  let endColumn = "E";

  if (updates.length === 0) {
    throw Error("at least one product needs to be sent for updating");
  }

  let data = updates.map((product, idx) => {
    return {
      range: `${startColumn}${startRow + idx}:${endColumn}${startRow + idx}`,
      values: [[product.quantity, product.availability, product.markup]],
    };
  });

  const request = {
    spreadsheetId,
    valueInputOption: "USER_ENTERED",
    resource: { data },
  };

  try {
    const response = await googleService.spreadsheets.values.batchUpdate(
      request
    );
    return response.data.totalUpdatedRows;
  } catch (error) {
    throw error;
  }
}

module.exports = sendUpdates;
