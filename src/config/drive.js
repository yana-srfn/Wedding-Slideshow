const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

let tokenCredentials;

if (process.env.GOOGLE_TOKEN_JSON) {
    // Railway deployment
    tokenCredentials = JSON.parse(
        process.env.GOOGLE_TOKEN_JSON
    );
} else {
    // Local development
    const tokenPath = path.join(
        __dirname,
        "../../token.json"
    );

    if (!fs.existsSync(tokenPath)) {
        throw new Error(
            "Google Drive credentials were not found. Add token.json locally or GOOGLE_TOKEN_JSON in Railway."
        );
    }

    const tokenContent = fs.readFileSync(
        tokenPath,
        "utf8"
    );

    tokenCredentials = JSON.parse(tokenContent);
}

const authentication =
    google.auth.fromJSON(tokenCredentials);

authentication.scopes = [
    "https://www.googleapis.com/auth/drive"
];

const drive = google.drive({
    version: "v3",
    auth: authentication
});

module.exports = drive;