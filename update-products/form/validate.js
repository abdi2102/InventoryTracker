const form = require("./schema");

function validateForm(req, res, next) {
  const { body, app } = req;
  try {
    // if (queryCustomIsValid === false) {
    //   throw { msg: "query options not valid", code: 400 };
    // }

    const validatedForm = form.validate(body, { abortEarly: false });

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
