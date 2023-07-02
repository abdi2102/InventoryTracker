const form = require("./schema");
const Sheet = require("../sheet/class");

function validateForm(req, res, next) {
  try {
    const formToValidate = {
      startRow: req.body.startRow || 2,
      numProducts: req.body.numProducts || 0,
      sheetLink: req.body.sheetLink,
      sheetName: req.body.sheetName || undefined,
      // TODO: VALIDATE CUSTOM OBJECT
      custom: JSON.parse(req.body.custom),
      merchant: req.body.merchant,
      template: req.body.template,
    };

    const allowedCustoms = ["retries", "updateAll"];

    const queryCustomIsValid = Object.keys(formToValidate.custom).every((_) => {
      return allowedCustoms.includes(_);
    });

    if (queryCustomIsValid === false) {
      throw { msg: "query options not valid", code: 400 };
    }

    const validatedForm = form.validate(formToValidate, { abortEarly: false });

    if (
      validatedForm.value.numProducts <= 0 &&
      validatedForm.value.custom["updateAll"] !== true
    ) {
      throw { msg: "at least one update required", code: 400 };
    }

    if (validatedForm.error) {
      const valErrors = validatedForm.error.details.map((err) => {
        return err.message;
      });

      throw { msg: valErrors, code: 400 };
    }

    req.sheet = new Sheet(
      (link = validatedForm.value.sheetLink),
      (sheetName = validatedForm.value.sheetName),
      (template = validatedForm.value.template)
    );

    req.updateQuery = validatedForm.value;
    next();
  } catch (err) {
    next({ msg: err.msg, code: err.code });
  }
}

module.exports = validateForm;
