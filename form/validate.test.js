const validateForm = require("./validate");
const Sheet = require("../sheet/class");

const jestRequest = function (startRow, numProducts, sheetLink, sheetName) {
  return {
    body: {
      startRow,
      numProducts,
      sheetLink,
      sheetName,
    },
  };
};

const jestResponse = function () {
  var res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

const invalidForm = {
  startRow: "0",
  numProducts: "0",
  sheetLink: "//www.example.com",
  sheetName: "",
};
const validForm = {
  startRow: "2",
  numProducts: "5",
  sheetLink: "https://docs.google.com/spreadsheets/d/practiceId/",
  sheetName: "validForm",
};
describe("only valid forms will be used for product updates", function () {
  test("form containing invalid values is rejected", function () {
    // expect status 400
    // expect response body with 4 errors
    // next function should not be called

    const req = jestRequest(
      invalidForm.startRow,
      invalidForm.numProducts,
      invalidForm.sheetLink,
      invalidForm.sheetName
    );

    const res = jestResponse();

    validateForm(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.lastCall[0].length).toBe(4);
    expect(mockNext).not.toHaveBeenCalled();
  });
  test("valid form is accepted", function () {
    // expect request object to have properties sheet, option
    // expect next function to execute

    const req = jestRequest(
      validForm.startRow,
      validForm.numProducts,
      validForm.sheetLink,
      validForm.sheetName
    );

    const res = jestResponse();

    validateForm(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();

    // Joi object converts string -> number
    expect(req.options).toEqual({
      startRow: parseInt(validForm.startRow),
      numProducts: parseInt(validForm.numProducts),
    });

    let sheet = new Sheet(validForm.sheetLink, validForm.sheetName);
    sheet.getId();

    expect(req.sheet).toEqual(sheet);
  });
});
