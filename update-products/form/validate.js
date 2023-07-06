const form = require("./schema");

function validateForm(req, res, next) {
  const { body, app } = req;

  try {
    console.log(req.body);
    const formToValidate = {
      sheetLink: body.sheetLink,
      sheetName: body.sheetName || undefined,
      // TODO: VALIDATE UPDATE OPTIONS
      updateOptions: JSON.parse(body.updateOptions),
      merchant: body.merchant,
      template: body.template,
      productsToUpdate: {
        numProducts: body.productsToUpdate.numProducts,
        updateAll: body.productsToUpdate.updateAll,
      },
    };

    const allowedOptions = ["retries", "startRow"];

    const queryCustomIsValid = Object.keys(formToValidate.updateOptions).every(
      (_) => {
        return allowedOptions.includes(_);
      }
    );

    if (queryCustomIsValid === false) {
      throw { msg: "query options not valid", code: 400 };
    }

    const validatedForm = form.validate(formToValidate, { abortEarly: false });

    if (
      validatedForm.value.productsToUpdate.numProducts <= 0 &&
      validatedForm.value.productsToUpdate.updateAll !== true
    ) {
      throw { msg: "at least one update required", code: 400 };
    }

    if (validatedForm.error) {
      const valErrors = validatedForm.error.details.map((err) => {
        return err.message;
      });

      throw { msg: valErrors.join(), code: 400 };
    }

    req.validatedForm = validatedForm.value;
    next();
  } catch (err) {
    console.log(err);
    app.get("io").emit("updatesComplete");

    next({ msg: err.msg, code: err.code });
  }
}

module.exports = validateForm;
