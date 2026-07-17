const { Readable } = require("stream");
const { drive } = require("../config/drive");

const GOOGLE_DRIVE_DATA_FOLDER_ID =
    process.env.GOOGLE_DRIVE_DATA_FOLDER_ID;

const MEMORIES_FILE_NAME = "memories.json";

const fs = require("fs");

const drive = require("../config/drive");

const GOOGLE_DRIVE_PHOTOS_FOLDER_ID =
    process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID;

const GOOGLE_DRIVE_VIDEOS_FOLDER_ID =
    process.env.GOOGLE_DRIVE_VIDEOS_FOLDER_ID;

function getFolderId(file) {

    if (file.mimetype.startsWith("image/")) {

        if (!GOOGLE_DRIVE_PHOTOS_FOLDER_ID) {
            throw new Error(
                "GOOGLE_DRIVE_PHOTOS_FOLDER_ID is missing."
            );
        }

        return GOOGLE_DRIVE_PHOTOS_FOLDER_ID;
    }

    if (file.mimetype.startsWith("video/")) {

        if (!GOOGLE_DRIVE_VIDEOS_FOLDER_ID) {
            throw new Error(
                "GOOGLE_DRIVE_VIDEOS_FOLDER_ID is missing."
            );
        }

        return GOOGLE_DRIVE_VIDEOS_FOLDER_ID;
    }

    throw new Error(
        "Only image and video files are supported."
    );
}

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

    const folderId =
        getFolderId(file);

    const fileName =
        `${Date.now()}-${file.originalname}`;

    const response =
        await drive.files.create({
            requestBody: {
                name: fileName,

                parents: [
                    folderId
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

async function getPhotoFiles() {

    const response = await drive.files.list({
        q: `'${process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID}' in parents and trashed = false`,
        fields: "files(id,name,mimeType,createdTime)",
        orderBy: "createdTime desc"
    });

    return response.data.files;
}

async function findMemoriesFile() {
    if (!GOOGLE_DRIVE_DATA_FOLDER_ID) {
        throw new Error(
            "GOOGLE_DRIVE_DATA_FOLDER_ID is not configured."
        );
    }

    const response = await drive.files.list({
        q: [
            `'${GOOGLE_DRIVE_DATA_FOLDER_ID}' in parents`,
            `name = '${MEMORIES_FILE_NAME}'`,
            "trashed = false"
        ].join(" and "),

        fields: "files(id, name)",
        spaces: "drive"
    });

    return response.data.files[0] || null;
}

async function createMemoriesFile() {
    const jsonContent =
        JSON.stringify([], null, 4);

    const response = await drive.files.create({
        requestBody: {
            name: MEMORIES_FILE_NAME,
            mimeType: "application/json",
            parents: [
                GOOGLE_DRIVE_DATA_FOLDER_ID
            ]
        },

        media: {
            mimeType: "application/json",
            body: Readable.from([jsonContent])
        },

        fields: "id, name"
    });

    return response.data;
}

async function getOrCreateMemoriesFile() {
    let memoriesFile =
        await findMemoriesFile();

    if (!memoriesFile) {
        memoriesFile =
            await createMemoriesFile();
    }

    return memoriesFile;
}

async function readMemoriesFromDrive() {
    const memoriesFile =
        await getOrCreateMemoriesFile();

    const response = await drive.files.get(
        {
            fileId: memoriesFile.id,
            alt: "media"
        },
        {
            responseType: "text"
        }
    );

    let data = response.data;

    if (Buffer.isBuffer(data)) {
        data = data.toString("utf8");
    }

    if (typeof data !== "string") {
        data = JSON.stringify(data);
    }

    if (!data.trim()) {
        return [];
    }

    const memoryList =
        JSON.parse(data);

    return Array.isArray(memoryList)
        ? memoryList
        : [];
}

async function saveMemoriesToDrive(memoryList) {
    const memoriesFile =
        await getOrCreateMemoriesFile();

    const jsonContent =
        JSON.stringify(memoryList, null, 4);

    await drive.files.update({
        fileId: memoriesFile.id,

        media: {
            mimeType: "application/json",
            body: Readable.from([jsonContent])
        },

        fields: "id, name, modifiedTime"
    });
}


module.exports = {
    uploadFileToDrive,
    getFileStreamFromDrive,
    deleteFileFromDrive,
    getPhotoFiles,
    readMemoriesFromDrive,
    saveMemoriesToDrive
};