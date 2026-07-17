const fs = require("fs");

const {
    getMemories,
    createMemory
} = require("../models/memoryModel");

const {
    uploadFileToDrive,
    getFileStreamFromDrive,
    deleteFileFromDrive
} = require("../services/googleDriveService");

function getAllMemories(req, res) {

    const memoryList = getMemories();

    res.status(200).json({
        success: true,
        data: memoryList
    });

}

async function uploadMemory(req, res) {

    let temporaryFilePath = null;

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please upload a photo or video."
            });

        }

        temporaryFilePath = req.file.path;

        const guestName = req.body.guestName?.trim();

        const message =
            req.body.message?.trim() || "";

        if (!guestName) {

            return res.status(400).json({
                success: false,
                message: "Guest name is required."
            });

        }

        const driveFile =
            await uploadFileToDrive(req.file);

        const memoryList = getMemories();

        const newMemory = {
            memoryId: memoryList.length + 1,

            guestName: guestName,
            message: message,

            originalFileName:
                req.file.originalname,

            fileType:
                req.file.mimetype,

            fileSize:
                req.file.size,

            driveFileId:
                driveFile.driveFileId,

            driveFileName:
                driveFile.driveFileName,

            driveViewUrl:
                driveFile.driveViewUrl,

            driveImageUrl:
                driveFile.driveImageUrl,

            driveDownloadUrl:
                driveFile.driveDownloadUrl,

            uploadedAt:
                new Date().toISOString()
        };

        createMemory(newMemory);

        res.status(201).json({
            success: true,

            message:
                "Memory uploaded successfully.",

            data: newMemory
        });

    } catch (error) {

        console.error("Google Drive upload error:");

        console.error(
            error.response?.data ||
            error.message ||
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.response?.data?.error?.message ||
                error.message ||
                "The memory could not be uploaded to Google Drive."
        });

    } finally {

        if (
            temporaryFilePath &&
            fs.existsSync(temporaryFilePath)
        ) {

            fs.unlinkSync(temporaryFilePath);

        }

    }

}

async function streamMemoryFile(req, res) {

    try {

        const memoryId =
            Number(req.params.memoryId);

        const memoryList =
            getMemories();

        const memory =
            memoryList.find(function (item) {
                return item.memoryId === memoryId;
            });

        if (!memory) {

            return res.status(404).json({
                success: false,
                message: "Memory not found."
            });

        }

        res.setHeader(
            "Content-Type",
            memory.fileType
        );

        res.setHeader(
            "Cache-Control",
            "public, max-age=3600"
        );

        const fileStream =
            await getFileStreamFromDrive(
                memory.driveFileId
            );

        fileStream.on("error", function (error) {

            console.error(
                "Drive streaming error:",
                error
            );

            if (!res.headersSent) {

                res.status(500).json({
                    success: false,
                    message:
                        "The memory file could not be loaded."
                });

            }

        });

        fileStream.pipe(res);

    } catch (error) {

        console.error(
            "Memory streaming error:",
            error.response?.data ||
            error.message ||
            error
        );

        if (!res.headersSent) {

            res.status(500).json({
                success: false,
                message:
                    "The memory file could not be loaded."
            });

        }

    }

}

module.exports = {
    getAllMemories,
    uploadMemory,
    streamMemoryFile
};