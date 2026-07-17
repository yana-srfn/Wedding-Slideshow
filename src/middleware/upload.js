const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

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

function fileFilter(req, file, callback) {
    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const validMimeType =
        allowedMimeTypes.includes(file.mimetype);

    const validExtension =
        allowedExtensions.includes(extension);

    if (validMimeType || validExtension) {
        callback(null, true);
    } else {
        callback(
            new Error("Only image and video files are allowed."),
            false
        );
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024
    },
    fileFilter: fileFilter
});

module.exports = upload;