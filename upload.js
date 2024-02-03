const createReadStream = require("fs").createReadStream;
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// Downloaded from while creating credentials of service account
const pkey = require("./pk.json");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

/**
 * Authorize with service account and get jwt client
 *
 */
async function authorize() {
  const jwtClient = new google.auth.JWT(
    pkey.client_email,
    null,
    pkey.private_key,
    SCOPES
  );
  await jwtClient.authorize();
  return jwtClient;
}

/**
 * Create a new file on google drive.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function uploadFile(authClient) {
  const drive = google.drive({ version: "v3", auth: authClient });

  const filePath = "test.txt";

  const file = await drive.files.create({
    media: {
      mimeType: "text/plain",
      body: createReadStream(filePath),
    },
    fields: "id,webViewLink",
    requestBody: {
      name: path.basename(filePath),
      parents: ["1xM2DWeGtX4eV8jtjl4NyYfDI1wV_UbpD"], // Share the folder with the service account email
    },
  });

  console.log(file.data.id, file.data.webViewLink);

  // Delete the local file after uploading to Google Drive
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting local file: ${err.message}`);
    } else {
      console.log(`Local file ${filePath} has been deleted successfully.`);
    }
  });
}

authorize().then(uploadFile).catch(console.error);
