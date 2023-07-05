const form = require("./schema");

function validateForm(req, res, next) {
  try {
    const formToValidate = {
      sheetLink: req.body.sheetLink,
      sheetName: req.body.sheetName || undefined,
      // TODO: VALIDATE CUSTOM OBJECT
      updateOptions: JSON.parse(req.body.updateOptions),
      merchant: req.body.merchant,
      template: req.body.template,
    };

    const allowedOptions = ["retries", "updateAll", "startRow", "numProducts"];

    const queryCustomIsValid = Object.keys(formToValidate.updateOptions).every((_) => {
      return allowedOptions.includes(_);
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

    req.validatedForm = validatedForm.value;
    next();
  } catch (err) {
    console.log(err)
    next({ msg: err.msg, code: err.code });
  }
}

module.exports = validateForm;
