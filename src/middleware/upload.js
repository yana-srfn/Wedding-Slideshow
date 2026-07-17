const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "uploads/");
    },

    filename: function (req, file, callback) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            path.extname(file.originalname);

        callback(null, uniqueName);
    }
});

function fileFilter(req, file, callback) {

    const allowedFileTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/quicktime"
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(
            new Error(
                "Only image and video files are allowed."
            ),
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