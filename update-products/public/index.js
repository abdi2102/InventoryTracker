window.addEventListener("load", () => {
  populateTableWithSavedSheets();
});

async function submitProductUpdates() {
  errorList.innerHTML = "";
  serverMsg.textContent = "";
  optionsSelectPicker.disabled = true;
  mainFormButton.disabled = true;
  try {
    const response = await sendPostRequest({
      startRow: startRow.value,
      numProducts: numProducts.value,
      sheetLink: sheetLinkInput.value,
      sheetName: sheetNameInput.value,
      custom: JSON.stringify(optionsSelectPicker.val() || []),
    });

    if (response === undefined) {
      serverMsg.textContent = "server error";
      return;
    }

    if (response.data.msg) {
      serverMsg.textContent = response.data.msg;

      // save successful sheets
      let googleSheet = {
        sheetName: sheetNameInput.value,
        sheetLink: sheetLinkInput.value,
      };
      const spreadsheetToBeSaved = false;
      saveGoogleSheets(googleSheet, spreadsheetToBeSaved);
    }

    mainFormButton.disabled = false;
    optionsSelectPicker.disabled = false;
  } catch (error) {
    mainFormButton.disabled = false;
    optionsSelectPicker.disabled = false;
    console.log(error);
    if (error.response === undefined) {
      console.log(error);
      serverMsg.textContent = "client side error";
    } else if (error.response.data instanceof Array) {
      error.response.data.forEach((error) => {
        const listItem = document.createElement("li");
        listItem.textContent = error.message;
        listItem.style.color = "red";
        errorList.appendChild(listItem);
      });
    } else if (error.response.data.msg) {
      serverMsg.textContent = error.response.data.msg;
    }
  }
}

function populateFormWithSheet(sheet) {
  sheetNameInput.value = sheet.sheetName;
  sheetLinkInput.value = sheet.sheetLink;
}

function saveGoogleSheets(googleSheet, spreadsheetToBeSaved) {
  if (
    googleSheet.sheetName === undefined ||
    googleSheet.sheetLink === undefined
  ) {
    return;
  }

  if (spreadsheetToBeSaved) {
    let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];

    googleSheets.push(googleSheet);

    if (googleSheets.length > 3) {
      googleSheets = googleSheets.slice(1, 4);
    }

    localStorage.setItem("googleSheets", JSON.stringify(googleSheets));
  }
}

function populateTableWithSavedSheets() {
  let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];

  if (googleSheets.length === 0 || googleSheets instanceof Array === false) {
    return;
  }

  googleSheets.forEach((sheet, idx) => {
    const button = document.createElement("button");
    button.innerHTML = sheet.sheetName;
    button.setAttribute("id", "sheetLinkButton");
    button.addEventListener("click", () => populateFormWithSheet(sheet));

    const tableRow = sheetLinksTable.insertRow(idx + 1);
    const sheetLinkCell = tableRow.insertCell(0);
    sheetLinkCell.appendChild(button);
  });
}

async function sendPostRequest({
  startRow,
  numProducts,
  sheetLink,
  sheetName,
  custom,
}) {
  try {
    return await axios.patch("http://localhost:3000/user/spreadsheet", {
      startRow,
      numProducts,
      sheetLink,
      sheetName,
      custom,
    });
  } catch (error) {
    throw error;
  }
}
