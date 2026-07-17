const multer = require("multer");

const path = require("path");

const fs = require("fs");

const uploadDirectory =
    path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}

const storage =
    multer.diskStorage({
        destination: function (
            req,
            file,
            callback
        ) {
            callback(
                null,
                uploadDirectory
            );
        },

        filename: function (
            req,
            file,
            callback
        ) {
            const safeFileName =
                file.originalname
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        "_"
                    );

            callback(
                null,
                `${Date.now()}-${safeFileName}`
            );
        }
    });

const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",

    "video/mp4",
    "video/quicktime",
    "video/webm"
];

const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".heic",
    ".heif",

    ".mp4",
    ".mov",
    ".webm"
];

function fileFilter(
    req,
    file,
    callback
) {
    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    const validMimeType =
        allowedMimeTypes.includes(
            file.mimetype
        );

    const validExtension =
        allowedExtensions.includes(
            extension
        );

    if (
        validMimeType ||
        validExtension
    ) {
        callback(null, true);
    } else {
        callback(
            new Error(
                "Only supported photo and video files are allowed."
            ),
            false
        );
    }
}

const upload =
    multer({
        storage: storage,

        limits: {
            fileSize:
                50 * 1024 * 1024
        },

        fileFilter: fileFilter
    });

module.exports = upload;