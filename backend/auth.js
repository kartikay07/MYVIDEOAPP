const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Path to the credentials file
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
// Path to save the token file
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Load client secrets from the credentials file
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const { client_secret, client_id, redirect_uris } = credentials.web;

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Generate the authentication URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'online',
  scope: ['https://www.googleapis.com/auth/drive'], // Adjust scopes as needed
});

console.log('Authorize this app by visiting this URL:', authUrl);

// Prompt the user to enter the authorization code
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('Enter the code from that page here: ', (code) => {
  readline.close();

  // Exchange the authorization code for tokens
  oAuth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('Error retrieving access token:', err);
      return;
    }

    // Save the token to a file
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Token saved to', TOKEN_PATH);
  });
});