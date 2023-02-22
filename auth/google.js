const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const verifyGoogleAccessTokenUrl =
  "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
// using the actual module is necessary b/c. jest is spying
// const getOAuth2ClientModule = require("./google-client");
const getOAuth2ClientModule = require("./google-client");
const axios = require("axios");

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
    res.cookie("refresh_token", token.tokens.refresh_token, { httpOnly: true });

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
    let token = req.cookies["token"];

    if (token === undefined && req.cookies["refresh_token"] === undefined) {
      return res.status(401).json({ msg: "Login Failed", authUrl });
    }

    try {
      if (token !== undefined) {
        // verify if token is valid
        const validateGoogleTokenUrl = `${verifyGoogleAccessTokenUrl}${token.token}`;
        await axios.get(validateGoogleTokenUrl);
      } else {
        throw "Access Token Not Valid";
      }
    } catch (error) {
      if (req.cookies["refresh_token"] !== undefined) {
        oAuth2Client.setCredentials({
          refresh_token: req.cookies["refresh_token"],
        });
        token = await oAuth2Client.getAccessToken();
        res.cookie("token", token, { httpOnly: true });
      } else {
        throw "Refresh Token Not Valid";
      }
    }
    oAuth2Client.setCredentials(token);
    req.oAuth2Client = oAuth2Client;
    next();
  } catch (error) {
    if (authUrl) {
      return res.status(401).json({ msg: "Login Failed", authUrl });
    } else {
      res.status(500).json({ msg: error.message });
    }
  }
}

module.exports = { authorize, getGmailUserInfoAndRedirect };
