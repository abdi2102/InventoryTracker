const { googleAuth, getOAuth2Client } = require("./google");

async function auth(req, res, next) {
  let authenticationScheme = req.cookies["auth_type"];
  req.session.redirectTo = req.originalUrl;

  try {
    let token = req.cookies["token"];
    const refresh_token = req.cookies["refresh_token"];

    if (authenticationScheme === undefined) {
      return res.redirect("/login");
    }

    switch (authenticationScheme) {
      case "google":
        const oAuth2Client = getOAuth2Client();

        const {
          isAuthenticated,
          oAuth2Client: google_auth,
          token: new_token,
        } = await googleAuth(oAuth2Client, refresh_token, token);

        if (isAuthenticated) {
          req.oAuth2Client = google_auth;

          res.cookie("token", new_token, { httpOnly: true });
          next();
        } else {
          res.redirect("/login");
        }
        break;
      default:
        throw { msg: "issue with login", code: 500 };
    }
  } catch (error) {
    next(error);
  }
}

module.exports = { auth };
