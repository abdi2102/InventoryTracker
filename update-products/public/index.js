const mainFormStartButton = document.getElementById("mainFormStartButton");
const mainFormPauseButton = document.getElementById("mainFormPauseButton");
const startRow = document.getElementById("startRowInput");
const numProducts = document.getElementById("numProductsInput");
const sheetNameInput = document.getElementById("sheetNameInput");
const sheetLinkInput = document.getElementById("sheetLinkInput");
const serverMsg = document.getElementById("serverMsg");
const sheetLinksTable = document.getElementById("googleSheetsLinksTable");

window.addEventListener("load", function () {
  populateTableWithSavedSheets();
});

// -----RUN UPDATES ---- //
async function startProductUpdates(event) {
  event.preventDefault();
  serverMsg.textContent = "";
  mainFormStartButton.disabled = true;
  try {
    const merchant = $(
      '#optionsSelectPicker optgroup[label="Merchant"] option:selected'
    ).val();
    const template = $(
      '#optionsSelectPicker optgroup[label="Template"] option:selected'
    ).val();

    let customObject = {};
    const _ = $('#optionsSelectPicker optgroup[label="Custom"] option:selected')
      .toArray()
      .forEach((_, opt) => {
        customObject[_.value] = true;
      });

    const response = await axios.patch(
      "http://localhost:3000/user/spreadsheet/update",
      {
        startRow: startRow.value,
        numProducts: numProducts.value,
        sheetLink: sheetLinkInput.value,
        sheetName: sheetNameInput.value,
        merchant,
        template,
        custom: JSON.stringify(customObject),
      }
    );

    if (response.data.msg) {
      serverMsg.textContent = response.data.msg;
    } else {
      serverMsg.textContent = "Unaccounted For Server Response";
    }
    saveGoogleSheets({
      sheetName: sheetNameInput.value,
      sheetLink: sheetLinkInput.value,
    });
  } catch (error) {
    console.log(error);
    if (error.code) {
      switch (error.code) {
        case "ERR_BAD_REQUEST":
          if (error.response.data.msg === "Login Failed") {
            window.location.href = error.response.data.authUrl;
          } else {
            serverMsg.textContent = error.response.data.msg;
          }
          break;
        case "ERR_NETWORK":
          serverMsg.textContent = "Error Connecting To Server...";
          break;
        default:
          serverMsg.textContent = "Unaccounted For Server Error";
      }
    } else {
      serverMsg.textContent = "Client Side Error";
      console.log(error);
    }
  }
  mainFormStartButton.disabled = false;
}

// -----RUN UPDATES ---- //

// -----PAUSE UPDATES ---- //

async function stopProductUpdates() {
  try {
    await axios.post("http://localhost:3000/user/spreadsheet/stop/updates");
  } catch (error) {
    console.log(error);
  }
}
// -----PAUSE UPDATES ---- //

function populateFormWithSheet(sheet) {
  const { sheetName, sheetLink } = sheet;

  if (sheetName !== "UNSPECIFIED") {
    sheetNameInput.value = sheetName;
  }

  sheetLinkInput.value = sheetLink;
}

function saveGoogleSheets(googleSheet) {
  let { sheetName, sheetLink } = googleSheet;

  if (
    sheetLink === undefined ||
    sheetName === undefined ||
    sheetName.length === 0
  ) {
    return;
  }

  let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];

  const validSave = googleSheets.every((sheet) => {
    return sheet.sheetName !== sheetName;
  });

  if (validSave) {
    googleSheets.unshift({ sheetName, sheetLink });

    if (googleSheets.length > 3) {
      googleSheets = googleSheets.slice(0, 3);
    }

    localStorage.setItem("googleSheets", JSON.stringify(googleSheets));
  }
}

function populateTableWithSavedSheets() {
  let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];

  if (googleSheets.length === 0 || googleSheets instanceof Array === false) {
    return;
  }

  const tableRow = sheetLinksTable.insertRow();

  googleSheets.forEach((sheet, idx) => {
    const button = document.createElement("button");
    button.innerHTML = sheet.sheetName;
    button.setAttribute("id", "sheetLinkButton");
    button.addEventListener("click", () => populateFormWithSheet(sheet));

    const sheetLinkCell = tableRow.insertCell(idx);
    sheetLinkCell.appendChild(button);
  });
}
