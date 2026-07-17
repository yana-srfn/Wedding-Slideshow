const fs = require("fs").promises;
const path = require("path");

const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const SCOPES = [
    "https://www.googleapis.com/auth/drive"
];

const CREDENTIALS_PATH = path.join(
    __dirname,
    "oauth-credentials.json"
);

const TOKEN_PATH = path.join(
    __dirname,
    "token.json"
);

async function saveCredentials(client) {

    const content = await fs.readFile(
        CREDENTIALS_PATH,
        "utf8"
    );

    const credentials = JSON.parse(content);

    const oauthCredentials =
        credentials.installed ||
        credentials.web;

    const payload = JSON.stringify(
        {
            type: "authorized_user",
            client_id:
                oauthCredentials.client_id,
            client_secret:
                oauthCredentials.client_secret,
            refresh_token:
                client.credentials.refresh_token
        },
        null,
        4
    );

    await fs.writeFile(
        TOKEN_PATH,
        payload
    );

}

async function authorizeGoogleDrive() {

    try {

        const client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH
        });

        await saveCredentials(client);

        const drive = google.drive({
            version: "v3",
            auth: client
        });

        const response = await drive.files.list({
            pageSize: 5,
            fields: "files(id, name)"
        });

        console.log(
            "Google Drive authorization successful."
        );

        console.log(
            "token.json has been created."
        );

        console.log(
            "Files found:",
            response.data.files
        );

    } catch (error) {

        console.error(
            "Google Drive authorization failed:",
            error.message
        );

    }

}

authorizeGoogleDrive();