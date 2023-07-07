const { requestGoogleAuth,googleAuth, getOAuth2Client } = require("./google");

async function getGmailUserInfoAndRedirect(req, res) {
  try {
    const oAuth2Client = getOAuth2Client();
    const token = await oAuth2Client.getToken(req.query.code);
    res.cookie("token", token.tokens, { httpOnly: true });
    // REFRESH_TOKEN SHOULD BE SAVED IN DATABASE FOR SAFETY
    res.cookie("refresh_token", token.tokens.refresh_token, {
      httpOnly: true,
      maxAge: 30 * 24 * 3600000,
    });
    const redirectTo = req.session.redirectTo || "";
    delete req.session.redirectTo;
    res.redirect(redirectTo);
  } catch (error) {
    res.send({ msg: "Issue with Login", code: 500 });
  }
}

async function googleLogin(req, res, next) {
  try {
    const token = req.cookies["token"];
    const refresh_token = req.cookies["refresh_token"];
    const oAuth2Client = getOAuth2Client();
    const { isAuthenticated } = await googleAuth(
      oAuth2Client,
      refresh_token,
      token
    );

    res.cookie("auth_type", "google", {
      httpOnly: true,
      maxAge: 30 * 24 * 3600000,
    });

    if (isAuthenticated === true) {
      res.redirect("/user/spreadsheet");
    }
    if (isAuthenticated === false) {
      let authUrl;
      const oAuth2Client = getOAuth2Client();
      authUrl = requestGoogleAuth(oAuth2Client);
      res.send({ authUrl });
    }
  } catch (error) {
    throw error;
  }
}

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
          oAuth2Client: oAuth,
          new_token,
        } = await googleAuth(oAuth2Client, refresh_token, token);

        if (isAuthenticated) {
          req.oAuth = oAuth;
          if (new_token) {
            res.cookie("token", new_token, {
              httpOnly: true,
              maxAge: 24 * 3600000,
            });
          }
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

module.exports = { auth, googleLogin, getGmailUserInfoAndRedirect };
