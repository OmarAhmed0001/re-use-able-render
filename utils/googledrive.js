"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDirectDownloadLink = void 0;
const googleapis_1 = require("googleapis");
const { OAuth2 } = googleapis_1.google.auth;
// Initialize the Google Drive API client library
// Define the OAuth2 client ID, client secret, and redirect URIs
const clientID = '486588801461-q2pp5v2ri0ookfuonlafv46fnq552q5s.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUris = [
    "https://saritestsecond.online:8080/api/v1/auth/google/callback",
    "https://saritestsecond.online/auth/google/callback",
];
// Set the scope for the Drive API
const scopes = ['https://www.googleapis.com/auth/drive'];
// Create the OAuth2 client
const auth = new OAuth2(clientID, clientSecret, redirectUris[0]);
// auth.setCredentials(require('./credentials.json'));
const drive = googleapis_1.google.drive({ version: 'v3', auth });
// Generate a direct download link for a Google Drive file
const generateDirectDownloadLink = async (fileId) => {
    try {
        const response = await drive.files.get({ fileId });
        const exportLinks = response.data.exportLinks;
        const downloadUrl = exportLinks ? exportLinks['application/octet-stream'] : null;
        return downloadUrl || null;
    }
    catch (error) {
        console.error('Error generating direct download link:', error);
        return null;
    }
};
exports.generateDirectDownloadLink = generateDirectDownloadLink;
