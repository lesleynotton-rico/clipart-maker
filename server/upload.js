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
const upload = multer({
  storage,
limits: { fileSize: 50 * 1024 * 1024 },
});

// Simple health check
app.get("/api/ping", (_req, res) => res.json({ ok: true }));

// Upload endpoint
app.post("/api/upload", upload.array("files", 50), (req, res) => {
  const files = (req.files || []).map(f => ({
    filename: f.filename,
    url: `/uploads/${f.filename}`,
  }));
  res.json({ ok: true, count: files.length, files });
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Start server
app.listen(PORT, () => console.log(`[upload] listening on :${PORT}`));
