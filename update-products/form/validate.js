const form = require("./schema");

function validateForm(req, res, next) {
  const { body, app } = req;
  try {
    const validatedForm = form.validate(body, { abortEarly: false });
    const { error: errors } = validatedForm;

    if (errors) {
      throw {
        msg: errors.details
          .map((err) => {
            return err.message;
          })
          .join(),
        code: 400,
      };
    }

    req.validatedForm = validateForm.value;
    next();
  } catch (err) {
    app.get("io").emit("updatesComplete");
    next({ msg: err.msg, code: err.code });
  }
}

module.exports = validateForm;
