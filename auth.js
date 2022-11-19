const fs = require("fs");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const { google } = require("googleapis");
const { verifyGoogleAccessTokenUrl } = require("./appHelpers");
const axios = require("axios");

function getOAuth2Client() {
  try {
    const content = fs.readFileSync("credentials.json");

    const {
      web: { client_secret, client_id, redirect_uris },
    } = JSON.parse(content);

    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  } catch (error) {
    throw Error(error);
  }
}

function requestGoogleAuth(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
}

async function getGmailUserInfo(req, res) {
  try {
    const oAuth2Client = getOAuth2Client();
    const token = await oAuth2Client.getToken(req.query.code);
    res.cookie("token", token.tokens);
  } catch (error) {
    throw error;
  }
}

async function authorize(req, res, next) {
  let authUrl;
  req.session.redirectTo = req.originalUrl;

  try {
    const oAuth2Client = getOAuth2Client();
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
      res.send({ msg: error });
    }
  }
}

module.exports = { authorize, getGmailUserInfo };
