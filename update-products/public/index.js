const sheetNameInput = document.getElementById("sheetNameInput");
const sheetLinkInput = document.getElementById("sheetLinkInput");
const sheetLinksTable = document.getElementById("googleSheetsLinksTable");
const socket = io();

window.addEventListener("load", function () {
  populateTableWithSavedSheets();
});

socket.on("updateProgress", (progress) => {
  $(".progress-bar").css({ width: progress + "%" });
});

socket.on("updatesComplete", async () => {
  $(".progress-bar").css("width", 0 + "%");
  $("#progress-div").css({ display: "none" });
  $("#mainFormStartButton").show();
  $("#mainFormPauseButton").hide();
});

// -----RUN UPDATES ---- //

function selectAllAttributes() {
  if ($("#checkAll").prop("checked") === true) {
    $("#attributeTableBody")
      .find("input.atrributecheckbox")
      .toArray()
      .forEach((checkbox) => (checkbox.checked = true));
  } else {
    $("#attributeTableBody")
      .find("input.atrributecheckbox")
      .toArray()
      .forEach((checkbox) => (checkbox.checked = false));
  }
  // $("#attributeTableBody")
  //   .find("input.atrributecheckbox")
  //   .toArray()
  //   .forEach((checkbox) => (checkbox.checked = true));
  // .toArray())
  // .forEach((checkbox) => checkbox.prop("checked", true));
}

async function startProductUpdates(event) {
  event.preventDefault();
  $("#progress-div").css({ display: "block" });
  $("#userMsg").text("");
  $("#mainFormStartButton").hide();
  $("#mainFormPauseButton").show();

  try {
    const startRow = $("#startRowInput").val();
    const numProducts = $("#numProductsInput").val();
    const merchant = $("#merchantPicker").find(":selected").val();
    const template = $("#templatePicker").find(":selected").val();
    const options = $("#optionsPicker option:selected")
      .toArray()
      .map((item) => item.value);

    const response = await axios.patch(
      "http://localhost:3000/user/spreadsheet/update",
      {
        merchant,
        sheet: {
          link: sheetLinkInput.value,
          name: sheetNameInput.value,
          template,
        },
        productsToUpdate: {
          updateAll: $("#updateAllInput").is(":checked"),
          numProducts: numProducts || 0,
        },
        updateOptions: {
          startRow: startRow || 2,
          retries: options.includes("retries"),
        },
        properties: ["quantity", "price", "availability"],
      }
    );

    if (response.data.msg) {
      $("#userMsg").text(response.data.msg);
    } else {
      $("#userMsg").text("Unaccounted For Error");
    }

    saveGoogleSheets({
      sheetName: sheetNameInput.value,
      sheetLink: sheetLinkInput.value,
    });
  } catch (error) {
    if (error.response) {
      $("#userMsg").text(error.response.data.msg);
    } else {
      $("#userMsg").text("Oops. Unaccounted For Error");
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
      $("#userMsg").text(response.data.msg);
    }
    $("#progress-div").css({ display: "none" });
  } catch (error) {
    if (error.response) {
      $("#userMsg").text(error.response.data.msg);
    } else {
      $("#userMsg").text("Oops. Unaccounted For Error");
    }
  }
}
// -----PAUSE UPDATES ---- //

function populateFormWithSheet(sheet) {
  const { sheetName, sheetLink } = sheet;

  sheetNameInput.value = sheetName;
  sheetLinkInput.value = sheetLink;
}

function saveGoogleSheets(googleSheet) {
  let { sheetName, sheetLink } = googleSheet;

  if (sheetLink === undefined || sheetName.length === 0) {
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
