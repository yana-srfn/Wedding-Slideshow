const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const tokenPath = path.join(
    __dirname,
    "../../token.json"
);

const tokenContent = fs.readFileSync(
    tokenPath,
    "utf8"
);

const tokenCredentials = JSON.parse(tokenContent);

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