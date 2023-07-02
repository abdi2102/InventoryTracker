const { googleAuth } = require("./google");

async function auth(req, res, next) {
  try {
    let authenticationScheme = "google";

    switch (authenticationScheme) {
      case "google":
        await googleAuth(req, res, next);
        next();
        break;
      case "internal":
        console.log("internal");
      default:
        throw { msg: "issue with login", code: 500 };
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { auth };
