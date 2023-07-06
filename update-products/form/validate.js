const form = require("./schema");

function validateUpdateForm(body) {
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
    return;
  } catch (err) {
    throw { msg: err.msg, code: err.code };
  }
}

module.exports = validateUpdateForm;
