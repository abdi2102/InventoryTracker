window.addEventListener("load", () => {
  populateTableWithSavedSheets();
});

async function submitProductUpdates() {
  const mainFormButton = document.getElementById("mainFormButton");
  const startRow = document.getElementById("startRowInput").value;
  const numProducts = document.getElementById("numProductsInput").value;
  const sheetName = document.getElementById("googleSheetNameInput").value;
  const sheetLink = document.getElementById("googleSheetLinkInput").value;
  const warningMsg = document.getElementById("warningMsg");
  const serverMsg = document.getElementById("serverMsg");
  const errorList = document.getElementById("errorList");
  errorList.innerHTML = "";

  warningMsg.style.display = "none";
  serverMsg.style.display = "inline";
  mainFormButton.disabled = true;

  try {
    const response = await sendPostRequest({
      startRow,
      numProducts,
      sheetLink,
      sheetName,
    });

    if (response === undefined) {
      serverMsg.textContent = "server error";
      return;
    }

    if (response.data.msg) {
      serverMsg.textContent = response.data.msg;

      // // save successful sheets
      let newGoogleSheet = { sheetName, sheetLink };
      saveGoogleSheets(newGoogleSheet);
    }

    mainFormButton.disabled = false;
  } catch (error) {
    if (error.response.data instanceof Array) {
      error.response.data.forEach((error) => {
        const listItem = document.createElement("li");
        listItem.textContent = error.message;
        listItem.style.color = "red";
        errorList.appendChild(listItem);
      });
    } else {
      console.log(error);
      serverMsg.textContent = "server error";
    }
    mainFormButton.disabled = false;
  }
}

function populateFormWithSheet(sheet) {
  document.getElementById("googleSheetNameInput").value = sheet.sheetName;
  document.getElementById("googleSheetLinkInput").value = sheet.sheetLink;
}

function saveGoogleSheets(newGoogleSheet) {
  const saveGoogleSheetCheckbox = document.getElementById(
    "saveGoogleSheetCheckbox"
  );

  if (
    newGoogleSheet.sheetName === undefined ||
    newGoogleSheet.sheetLink === undefined
  ) {
    return;
  }

  if (saveGoogleSheetCheckbox.checked) {
    let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];
    googleSheets.unshift(newGoogleSheet);

    if (googleSheets.length > 3) {
      googleSheets.slice(0, 2);
    }

    localStorage.setItem("googleSheets", JSON.stringify(googleSheets));
  }
}

function populateTableWithSavedSheets() {
  const sheetLinksTable = document.getElementById("googleSheetsLinksTable");
  let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];
  if (googleSheets.length === 0) {
    return;
  }
  googleSheets.forEach((sheet, idx) => {
    const button = document.createElement("button");
    button.innerHTML = "Click Here";
    button.addEventListener("click", () => populateFormWithSheet(sheet));
    const tableRow = sheetLinksTable.insertRow(idx + 1);
    const sheetNameCell = tableRow.insertCell(0);
    const sheetLinkCell = tableRow.insertCell(1);

    sheetNameCell.setAttribute("id", "sheetNameCell");
    sheetLinkCell.setAttribute("id", "sheetLinkCell");

    sheetLinkCell.appendChild(button);
    sheetNameCell.innerHTML = sheet.sheetName;
  });
}

async function sendPostRequest({
  startRow,
  numProducts,
  sheetLink,
  sheetName,
}) {
  try {
    return await axios.patch("http://localhost:3000/user/spreadsheet", {
      startRow,
      numProducts,
      sheetLink,
      sheetName,
    });
  } catch (error) {
    console.log(error)
    throw error;
  }
}
