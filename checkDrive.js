const drive = require("./src/config/drive");

async function checkDrive() {

    try {

        const aboutResponse = await drive.about.get({
            fields: "user"
        });

        console.log("Google account used by Node:");
        console.log(aboutResponse.data.user);

        const folderResponse = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: "files(id, name)",
            pageSize: 100,
            spaces: "drive"
        });

        console.log("\nFolders visible to Node:");

        folderResponse.data.files.forEach(function (folder) {
            console.log(`${folder.name}: ${folder.id}`);
        });

    } catch (error) {

        console.error(
            error.response?.data ||
            error.message ||
            error
        );

    }

}

checkDrive();