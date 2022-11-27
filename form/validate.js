const Sheet = require("../sheet/class");
const form = require("./schema");

function validateForm(req, res, next) {
  const formToValidate = {
    startRow: req.body.startRow,
    numProducts: req.body.numProducts,
    sheetLink: req.body.sheetLink,
    sheetName: req.body.sheetName,
  };

  const validatedForm = form.validate(formToValidate, { abortEarly: false });

  if (validatedForm.error) {
    return res.status(400).json(validatedForm.error.details);
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
}

module.exports = validateForm;
