const form = require("./schema");
const Sheet = require("../../sheet/class");

function validateForm(req, res, next) {
  try {
    const formToValidate = {
      startRow: req.body.startRow || 2,
      numProducts: req.body.numProducts || 0,
      sheetLink: req.body.sheetLink,
      sheetName: req.body.sheetName || undefined,
      custom: JSON.parse(req.body.custom),
      merchant: req.body.merchant,
      template: req.body.template,
    };

    const allowedCustoms = ["retries", "updateAll"];
    const queryCustomIsValid = formToValidate.custom.every((_) => {
      return allowedCustoms.includes(_);
    });

    if (queryCustomIsValid === false) {
      return res.status(400).json({ msg: "query options not valid" });
    }

    const validatedForm = form.validate(formToValidate, { abortEarly: false });

    let valErrors = [];

    if (
      validatedForm.value.numProducts <= 0 &&
      validatedForm.value.custom.includes("updateAll") === false
    ) {
      valErrors.push("at least one update required");
    }

    if (validatedForm.error) {
      validatedForm.error.details.forEach((err) => {
        valErrors.push(err.message);
      });

    }

    if (valErrors.length > 0) {
      let sanitizedValErrors = "";
      valErrors.forEach((err) => {
        sanitizedValErrors += `${err}\n`;
      });

      return res.status(400).json({ msg: sanitizedValErrors });
    }

    req.sheet = new Sheet(
      (link = validatedForm.value.sheetLink),
      (sheetName = validatedForm.value.sheetName),
      (template = validatedForm.value.template)
    );

    req.updateQuery = validatedForm.value;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
}

module.exports = validateForm;
