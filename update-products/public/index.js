const mainFormStartButton = document.getElementById("mainFormStartButton");
const mainFormPauseButton = document.getElementById("mainFormPauseButton");
const startRow = document.getElementById("startRowInput");
const numProducts = document.getElementById("numProductsInput");
const sheetNameInput = document.getElementById("sheetNameInput");
const sheetLinkInput = document.getElementById("sheetLinkInput");
const serverMsg = document.getElementById("serverMsg");
const sheetLinksTable = document.getElementById("googleSheetsLinksTable");
const socket = io();

window.addEventListener("load", function () {
  populateTableWithSavedSheets();
});

socket.on("updateProgress", (progress) => {
  console.log(progress);
  $("#progress-div").css({ display: "block" });

  $(".progress-bar").css({ width: progress + "%" });
});

socket.on("updatesComplete", async () => {
  $(".progress-bar").css("width", 0 + "%");
  $("#progress-div").css({ display: "none" });
  $("#serverMsg").text("");
});

// -----RUN UPDATES ---- //

async function startProductUpdates(event) {
  event.preventDefault();
  $("#progress-div").css({ display: "block" });
  $("#serverMsg").text("");

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
      console.log(response);
      $("#serverMsg").text("Unaccounted For Server Response");
    }

    saveGoogleSheets({
      sheetName: sheetNameInput.value,
      sheetLink: sheetLinkInput.value,
    });
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
        case "ERR_BAD_RESPONSE":
          serverMsg.textContent = error.response.data.msg;
          break;
        default:
          console.log(error.code);
          serverMsg.textContent = "Unaccounted For Server Error";
      }
    } else {
      serverMsg.textContent = "Client Side Error";
      console.log(error);
    }
  }
}

// -----RUN UPDATES ---- //

// -----PAUSE UPDATES ---- //

async function stopProductUpdates() {
  try {
    const response = await axios.get(
      "http://localhost:3000/user/spreadsheet/updates/stop/"
    );
    if (response.data.msg) {
      serverMsg.textContent = response.data.msg;
    }
    $("#progress-div").css({ display: "none" });
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
    return sheet.sheetName !== sheetName && sheet.sheetLink !== sheetLink;
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

  sheetLinksTable.style.display = "block";
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
