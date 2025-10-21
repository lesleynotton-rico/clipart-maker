// server/upload.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5174;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Simple health check
app.get("/api/ping", (_req, res) => res.json({ ok: true }));

// Upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    ok: true,
    filename: req.file.filename,
    url: fileUrl,
  });
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Start server
app.listen(PORT, () => console.log(`[upload] listening on :${PORT}`));
