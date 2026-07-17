const fs = require("fs");

const drive = require("../config/drive");

async function uploadFileToDrive(file) {

    let folderId;

    if (file.mimetype.startsWith("image/")) {

        folderId =
            process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID;

    } else {

        folderId =
            process.env.GOOGLE_DRIVE_VIDEOS_FOLDER_ID;

    }

async function checkFolderAccess(folderId) {

    const response = await drive.files.get({
        fileId: folderId,
        fields: "id, name, mimeType"
    });

    console.log("Folder found:", response.data);

}
await checkFolderAccess(folderId);

    if (!folderId) {

        throw new Error(
            "The Google Drive folder ID is missing from the .env file."
        );

    }

    const fileMetadata = {
        name: file.originalname,
        parents: [
            folderId
        ]
    };

    const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, mimeType, size, createdTime"
    });

    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: "reader",
            type: "anyone"
        }
    });

    return {
        driveFileId: response.data.id,
        driveFileName: response.data.name,
        driveMimeType: response.data.mimeType,
        driveFileSize: response.data.size,
        driveCreatedTime: response.data.createdTime,

        driveViewUrl:
            `https://drive.google.com/file/d/${response.data.id}/view`,

        driveImageUrl:
            `https://drive.google.com/thumbnail?id=${response.data.id}&sz=w1600`,

        driveDownloadUrl:
            `https://drive.google.com/uc?export=download&id=${response.data.id}`
    };

}

async function getFileStreamFromDrive(fileId) {

    const response = await drive.files.get(
        {
            fileId: fileId,
            alt: "media"
        },
        {
            responseType: "stream"
        }
    );

    return response.data;
}

async function deleteFileFromDrive(fileId) {

    if (!fileId) {
        return;
    }

    await drive.files.delete({
        fileId: fileId
    });

}

module.exports = {
    uploadFileToDrive,
    getFileStreamFromDrive,
    deleteFileFromDrive
};