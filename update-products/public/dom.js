const mainFormStartButton = document.getElementById("mainFormStartButton");
const mainFormPauseButton = document.getElementById("mainFormPauseButton");
const startRow = document.getElementById("startRowInput");
const numProducts = document.getElementById("numProductsInput");
const sheetNameInput = document.getElementById("sheetNameInput");
const sheetLinkInput = document.getElementById("sheetLinkInput");
const serverMsg = document.getElementById("serverMsg");
const errorList = document.getElementById("errorList");
const sheetLinksTable = document.getElementById("googleSheetsLinksTable");

$("#optionsSelectPicker").multiselect({
  buttonTitle: function () {},
});
