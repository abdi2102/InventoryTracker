const { validateForm } = require("../validate-form");
const request = require("supertest");
const app = require("../backend/express/app");

const invalidForm = {
  startRow: "0",
  numProducts: "0",
  sheetLink: "//www.example.com",
  sheetName: "",
};

const validForm = {
  startRow: "2",
  numProducts: "5",
  sheetLink: "http://www.example.com",
  sheetName: "validForm",
};

describe("valid forms will be used for product updates", () => {
  test("invalid form is rejected", async () => {
    // expect status 400
    // expect response body with 4 errors
  });

  test("valid form is accepted", async () => {
    // expect request object to have set parameters
    // expect next function to execute
  });
});
