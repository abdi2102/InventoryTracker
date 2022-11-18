window.addEventListener("load", () => {
  populateTableWithSavedSheets();
});



async function submitProductUpdates() {
  // temp.fix
  alert("make sure to read/write permission to anyone with the link");

  const mainFormButton = document.getElementById("mainFormButton");
  const startRow = document.getElementById("startRowInput").value;
  const numProducts = document.getElementById("numProductsInput").value;
  const spreadsheetName = document.getElementById("googleSheetNameInput").value;
  const spreadsheetLink = document.getElementById("googleSheetLinkInput").value;
  const serverMsg = document.getElementById("serverMsg");
  const mainForm = document.getElementById("mainForm");

  mainFormButton.disabled = true;

  const response = await sendPostRequest({
    startRow,
    numProducts,
    spreadsheetLink,
  });

  if (response !== undefined) {
    if (response.data.msg) {
      serverMsg.textContent = response.data.msg;

      // // save successful sheets
      let newGoogleSheet = { spreadsheetName, spreadsheetLink };
      saveGoogleSheets(newGoogleSheet);

      // clear form fields, re-enable button at end
      mainForm.reset();
      mainFormButton.disabled = false;
    } else if (response.data.authUrl) {
      window.location.href = response.data.authUrl;
    }
  } else {
    alert("server error...");
    mainFormButton.disabled = false;
  }
}

function populateFormWithSpreadsheet(event) {
  const tableRowCells = event.target.parentElement.cells;

  document.getElementById("googleSheetNameInput").value =
    tableRowCells[0].innerHTML;
  document.getElementById("googleSheetLinkInput").value =
    tableRowCells[1].innerHTML;
}

function saveGoogleSheets(newGoogleSheet) {
  const saveGoogleSheetCheckbox = document.getElementById(
    "saveGoogleSheetCheckbox"
  );

  if (saveGoogleSheetCheckbox.checked) {
    let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];
    googleSheets.unshift(newGoogleSheet);

    if (googleSheets.length > 3) {
      googleSpreadsheets.slice(0, 2);
    }

    localStorage.setItem("googleSheets", JSON.stringify(googleSheets));
  }
}

function populateTableWithSavedSheets() {
  const spreadsheetLinksTable = document.getElementById(
    "googleSheetsLinksTable"
  );
  let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];
  if (googleSheets.length !== 0) {
    googleSheets.forEach((sheet, idx) => {
      let tableRow = spreadsheetLinksTable.insertRow(idx + 1);
      tableRow.addEventListener("click", populateFormWithSpreadsheet);
      let sheetNameCell = tableRow.insertCell(0);
      let sheetLinkCell = tableRow.insertCell(1);

      sheetNameCell.setAttribute("id", "sheetNameCell");
      sheetLinkCell.setAttribute("id", "sheetLinkCell");

      sheetNameCell.innerHTML = sheet.spreadsheetName;
      sheetLinkCell.innerHTML = sheet.spreadsheetLink;
    });
  }
}

async function sendPostRequest(body) {
  try {
    const response = await axios.patch(
      "http://localhost:3000/user/spreadsheet",
      {
        startRow: body.startRow,
        numProducts: body.numProducts,
        spreadsheetLink: body.spreadsheetLink,
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
}
