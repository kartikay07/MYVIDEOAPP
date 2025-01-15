const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load credentials from the JSON file
const credentials = require('./credentials.json');

// OAuth2 client
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Set up Google Drive API
const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Load or generate a token
const TOKEN_PATH = path.join(__dirname, 'token.json');
if (fs.existsSync(TOKEN_PATH)) {
  const token = fs.readFileSync(TOKEN_PATH);
  oAuth2Client.setCredentials(JSON.parse(token));
} else {
  console.error('Token not found. Please authenticate first.');
}

/**
 * Upload a file to Google Drive
 * @param {string} filePath - Path to the file to upload
 * @param {string} mimeType - MIME type of the file (e.g., 'application/pdf', 'video/mp4')
 * @returns {Promise<string>} - File ID of the uploaded file
 */
const uploadFile = async (filePath, mimeType) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: path.basename(filePath), // File name
        mimeType, // MIME type of the file
      },
      media: {
        mimeType,
        body: fs.createReadStream(filePath), // File stream
      },
    });

    console.log('File uploaded to Google Drive:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};

/**
 * Generate a public URL for a file in Google Drive
 * @param {string} fileId - File ID of the uploaded file
 * @returns {Promise<string>} - Public URL of the file
 */
const generatePublicUrl = async (fileId) => {
  try {
    // Make the file publicly accessible
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get the file's metadata
    const response = await drive.files.get({
      fileId,
      fields: 'webViewLink',
    });

    console.log('Public URL generated:', response.data.webViewLink);
    return response.data.webViewLink;
  } catch (error) {
    console.error('Error generating public URL:', error);
    throw error;
  }
};

module.exports = { uploadFile, generatePublicUrl };