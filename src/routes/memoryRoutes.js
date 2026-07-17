const express = require("express");

const upload = require("../middleware/upload");

const {
    getAllMemories,
    uploadMemory,
    streamMemoryFile
} = require("../controllers/memoryController");

const router = express.Router();

console.log("Memory routes loaded");

router.get("/", getAllMemories);

router.get("/:memoryId/media", streamMemoryFile);

router.post(
    "/",
    upload.single("media"),
    uploadMemory
);

module.exports = router;