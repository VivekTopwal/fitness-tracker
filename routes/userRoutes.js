const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, req.user.id + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ✅ Upload Profile Picture Route
router.put("/upload-profile-pic", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: "Profile picture updated!", profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
