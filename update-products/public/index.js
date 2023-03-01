window.addEventListener("load", () => {
  populateTableWithSavedSheets();
});

// -----RUN UPDATES ---- //
async function startProductUpdates() {
  serverMsg.textContent = "";
  mainFormStartButton.style.display = "none";
  mainFormPauseButton.style.display = "block";
  try {
    const merchant = $(
      '#optionsSelectPicker optgroup[label="Merchant"] option:selected'
    ).val();
    const template = $(
      '#optionsSelectPicker optgroup[label="Template"] option:selected'
    ).val();

    const custom = $(
      '#optionsSelectPicker optgroup[label="Custom"] option:selected'
    )
      .map((_, opt) => {
        return opt.value;
      })
      .toArray();

    const response = await axios.patch(
      "http://localhost:3000/user/spreadsheet",
      {
        startRow: startRow.value,
        numProducts: numProducts.value,
        sheetLink: sheetLinkInput.value,
        sheetName: sheetNameInput.value,
        merchant,
        template,
        custom: JSON.stringify(custom),
      }
    );

    if (response.data.msg) {
      serverMsg.textContent = response.data.msg;
      saveGoogleSheets({
        sheetName: sheetNameInput.value,
        sheetLink: sheetLinkInput.value,
      });
    } else {
      serverMsg.textContent = "Unaccounted For Server Response";
    }
  } catch (error) {
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
  mainFormStartButton.style.display = "block";
  mainFormPauseButton.style.display = "none";
}

// -----RUN UPDATES ---- //

// -----PAUSE UPDATES ---- //

async function stopProductUpdates() {}
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

  if (sheetName === undefined || sheetName.length === 0) {
    sheetName = "UNSPECIFIED";
  }

  if (googleSheet.sheetLink === undefined) {
    return;
  }

  let googleSheets = JSON.parse(localStorage.getItem("googleSheets")) || [];

  googleSheets.unshift({ sheetName, sheetLink });

  if (googleSheets.length > 3) {
    googleSheets = googleSheets.slice(0, 3);
  }

  localStorage.setItem("googleSheets", JSON.stringify(googleSheets));
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
