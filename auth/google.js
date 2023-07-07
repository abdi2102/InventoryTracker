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
    throw { msg: "Error authenticating request.", code: 500 };
  }
}

function requestGoogleAuth(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
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
  requestGoogleAuth,
  googleAuth,
  getOAuth2Client,
};
