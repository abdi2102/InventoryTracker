const Sheet = require("./classes/sheet");
const form = require("./schemas/form");

function validateForm(req, res, next) {
  const formToValidate = {
    startRow: req.body.startRow,
    numProducts: req.body.numProducts,
    sheetLink: req.body.sheetLink,
    sheetName: req.body.sheetName,
  };
  try {
    const validatedForm = form.validate(formToValidate, { abortEarly: false });

    if (validatedForm.error) {
      throw validatedForm.error.details;
    }

    const sheet = new Sheet(
      (link = validatedForm.value.sheetLink),
      (sheetName = validatedForm.value.sheetName)
    );

    sheet.getId();
    req.sheet = sheet;
    req.options = {
      startRow: validatedForm.value.startRow,
      numProducts: validatedForm.value.numProducts,
    };
    next();
  } catch (errors) {
    res.send(errors).status(400);
  }
}

module.exports = { validateForm };
