const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const verifyGoogleAccessTokenUrl =
  "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
const axios = require("axios");
const { readFileSync } = require("fs");
const { google } = require("googleapis");

function getOAuth2Client() {
  try {
    const content = readFileSync("credentials.json");

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
    res.send({ msg: error.message });
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

async function googleAuth(oAuth2Client, refresh_token, token) {
  let isAuthenticated = false;
  let new_token;

  try {
    try {
      if (token !== undefined) {
        // verify if token is valid
        const validateGoogleTokenUrl = `${verifyGoogleAccessTokenUrl}${token.token}`;
        await axios.get(validateGoogleTokenUrl);
      } else {
        throw Error();
      }
    } catch (error) {
      new_token = await refreshGoogleAccessToken(refresh_token, oAuth2Client);
    }

    oAuth2Client.setCredentials({
      access_token: new_token !== undefined ? new_token.token : token.token,
      refresh_token,
    });

    isAuthenticated = true;
    return { isAuthenticated, oAuth2Client, new_token };
  } catch (error) {
    return { isAuthenticated };
  }
}

async function refreshGoogleAccessToken(refresh_token, oAuth2Client) {
  try {
    if (refresh_token !== undefined) {
      oAuth2Client.setCredentials({
        refresh_token,
      });
      token = await oAuth2Client.getAccessToken();
      return token;
    }
    throw Error();
  } catch (error) {
    throw error;
  }
}

module.exports = {
  googleLogin,
  googleAuth,
  getGmailUserInfoAndRedirect,
  getOAuth2Client,
};
