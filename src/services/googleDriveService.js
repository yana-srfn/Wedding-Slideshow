const fs = require("fs");

const drive =
    require("../config/drive");

const GOOGLE_DRIVE_FOLDER_ID =
    process.env.GOOGLE_DRIVE_FOLDER_ID;

async function uploadFileToDrive(file) {
    if (!file) {
        throw new Error(
            "No file was provided for upload."
        );
    }

    if (!file.path) {
        throw new Error(
            "The uploaded file does not have a temporary path."
        );
    }

    if (!GOOGLE_DRIVE_FOLDER_ID) {
        throw new Error(
            "GOOGLE_DRIVE_FOLDER_ID is missing."
        );
    }

    const fileName =
        `${Date.now()}-${file.originalname}`;

    const response =
        await drive.files.create({
            requestBody: {
                name: fileName,

                parents: [
                    GOOGLE_DRIVE_FOLDER_ID
                ]
            },

            media: {
                mimeType: file.mimetype,

                body:
                    fs.createReadStream(
                        file.path
                    )
            },

            fields: "id,name"
        });

    const driveFileId =
        response.data.id;

    if (!driveFileId) {
        throw new Error(
            "Google Drive did not return a file ID."
        );
    }

    await drive.permissions.create({
        fileId: driveFileId,

        requestBody: {
            role: "reader",
            type: "anyone"
        }
    });

    return {
        driveFileId: driveFileId,

        driveFileName:
            response.data.name,

        driveViewUrl:
            `https://drive.google.com/file/d/${driveFileId}/view`,

        driveImageUrl:
            `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`,

        driveDownloadUrl:
            `https://drive.google.com/uc?export=download&id=${driveFileId}`
    };
}

async function getFileStreamFromDrive(fileId) {
    if (!fileId) {
        throw new Error(
            "Missing required parameter: fileId"
        );
    }

    const response =
        await drive.files.get(
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
        throw new Error(
            "Missing required parameter: fileId"
        );
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