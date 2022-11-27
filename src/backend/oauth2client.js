const fs = require("fs");
const { google } = require("googleapis");

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


module.exports = { getOAuth2Client };
