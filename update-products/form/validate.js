const Sheet = require("../../sheet/class");
const form = require("./schema");

function validateForm(req, res, next) {
  try {
    const formToValidate = {
      startRow: req.body.startRow || 2,
      numProducts: req.body.numProducts || 0,
      sheetLink: req.body.sheetLink,
      sheetName: req.body.sheetName || undefined,
      retries: req.body.retries,
      updateAll: req.body.updateAll,
    };

    const validatedForm = form.validate(formToValidate, { abortEarly: false });

    if (validatedForm.error) {
      return res.status(400).json(validatedForm.error.details);
    }

    if (formToValidate.numProducts <= 0 && formToValidate.updateAll === false) {
      return res.status(400).json({
        msg: "At least one update required",
      });
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
      retries: validatedForm.value.retries,
      updateAll: validatedForm.value.updateAll,
    };
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
}

module.exports = validateForm;
