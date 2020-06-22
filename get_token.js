const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];  //< if you change this - then `rm ${TOKEN_PATH}`
const TOKEN_PATH = 'token.json';


fs.readFile('credentials.json', (error, content) => {
  if (error) return console.log("Error loading client secret file: ", error);
  authorize(JSON.parse(content));
});

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  getNewToken(oAuth2Client, () => console.log("Well done!"));
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (error, token) => {
      if (error) return console.error("Error while trying to retrieve access token", error);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), error => {
        if (error) console.error(error);
        console.log("Token stored to:", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
