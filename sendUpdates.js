async function sendUpdates(googleService, spreadsheetId, updates, startRow) {
  let startColumn = "C";
  let endColumn = "E";

  if (updates.length === 0) {
    return;
  }

  let data = updates.map((product, idx) => {
    return {
      range: `${startColumn}${startRow + idx}:${endColumn}${startRow + idx}`,
      values: [[product.quantity, product.availability, product.price]],
    };
  });

  const request = {
    spreadsheetId,
    valueInputOption: "USER_ENTERED",
    resource: { data },
  };

  try {
    await googleService.spreadsheets.values.batchUpdate(request);
  } catch (error) {
    throw error;
  }
}

module.exports = sendUpdates;
