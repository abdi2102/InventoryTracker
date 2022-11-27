const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const verifyGoogleAccessTokenUrl =
  "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
const axios = require("axios");
// using the actual module is necessary b/c. jest is spying
const getOAuth2ClientModule = require("../backend/oauth2client");

function requestGoogleAuth(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
}

async function getGmailUserInfoAndRedirect(req, res) {
  try {
    const oAuth2Client = getOAuth2ClientModule.getOAuth2Client();
    const token = await oAuth2Client.getToken(req.query.code);
    res.cookie("token", token.tokens, { httpOnly: true });

    const redirectTo = req.session.redirectTo || "";
    delete req.session.redirectTo;
    res.redirect(redirectTo);
  } catch (error) {
    res.send({ msg: error.message });
  }
}

async function authorize(req, res, next) {
  let authUrl;
  req.session.redirectTo = req.originalUrl;

  try {
    const oAuth2Client = getOAuth2ClientModule.getOAuth2Client();
    authUrl = requestGoogleAuth(oAuth2Client);
    const token = req.cookies["token"];

    if (token === undefined) {
      res.redirect(authUrl);
      return;
    }

    // verify if token is valid
    const validateGoogleTokenUrl = `${verifyGoogleAccessTokenUrl}${token.access_token}`;

    await axios.get(validateGoogleTokenUrl);
    oAuth2Client.setCredentials(token);
    req.oAuth2Client = oAuth2Client;
    next();
  } catch (error) {
    if (authUrl) {
      res.redirect(authUrl);
    } else {
      res.status(500).json({ msg: error.message });
    }
  }
}

module.exports = { authorize, getGmailUserInfoAndRedirect };
