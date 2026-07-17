require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const memoryRoutes = require("./src/routes/memoryRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// API Routes
app.use("/api/memories", memoryRoutes);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files (for now, until Google Drive)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(function (error, req, res, next) {

    if (error.code === "LIMIT_FILE_SIZE") {

        return res.status(400).json({
            success: false,
            message: "The selected file must be 25 MB or smaller."
        });

    }

    if (error.message === "Only image and video files are allowed.") {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

    console.error(error);

    res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });

});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Wedding Memory Garden API is running!"
    });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});