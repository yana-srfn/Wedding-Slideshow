const fs = require("fs");

const {
    getMemories,
    createMemory
} = require("../models/memoryModel");

const {
    uploadFileToDrive,
    getFileStreamFromDrive
} = require("../services/googleDriveService");

async function getAllMemories(req, res) {
    try {
        const memoryList =
            await getMemories();

        const sortedMemories =
            memoryList.sort(
                function (
                    firstMemory,
                    secondMemory
                ) {
                    return (
                        new Date(
                            secondMemory.uploadedAt
                        ) -
                        new Date(
                            firstMemory.uploadedAt
                        )
                    );
                }
            );

        res.status(200).json({
            success: true,
            data: sortedMemories
        });
    } catch (error) {
        console.error(
            "Get memories error:",
            error.response?.data ||
            error.message ||
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Memories could not be loaded."
        });
    }
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

        const guestName =
            req.body.guestName?.trim();

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

        if (!driveFile?.driveFileId) {
            throw new Error(
                "Google Drive did not return a file ID."
            );
        }

        const memoryList = await getMemories();

        const highestMemoryId =
            memoryList.reduce(function (highestId, memory) {
                return Math.max(
                    highestId,
                    Number(memory.memoryId) || 0
                );
            }, 0);

        const newMemory = {
            memoryId: highestMemoryId + 1,

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

        await createMemory(newMemory);

        res.status(201).json({
            success: true,
            message: "Memory uploaded successfully.",
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
            try {
                fs.unlinkSync(temporaryFilePath);
            } catch (error) {
                console.error(
                    "Temporary file deletion error:",
                    error.message
                );
            }
        }
    }
}

async function streamMemoryFile(req, res) {
    try {
        const memoryId =
            Number(req.params.memoryId);

        if (!Number.isInteger(memoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid memory ID."
            });
        }

        const memoryList = await getMemories();

        const memory =
            memoryList.find(function (item) {
                return Number(item.memoryId) === memoryId;
            });

        if (!memory) {
            return res.status(404).json({
                success: false,
                message: "Memory not found."
            });
        }

        if (!memory.driveFileId) {
            return res.status(404).json({
                success: false,
                message:
                    "This memory does not have a Google Drive file ID."
            });
        }

        const fileStream =
            await getFileStreamFromDrive(
                memory.driveFileId
            );

        res.setHeader(
            "Content-Type",
            memory.fileType ||
            "application/octet-stream"
        );

        res.setHeader(
            "Cache-Control",
            "public, max-age=3600"
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
            } else {
                res.destroy(error);
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