function joiErrorHandler(valForm) {
  try {
    const { error: errors } = valForm;
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

module.exports = joiErrorHandler ;
