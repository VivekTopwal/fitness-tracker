const bcrypt = require("bcryptjs");

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
  fs.mkdirSync(uploadDir, { recursive: true }); // ✅ Ensure directory exists
}

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // ✅ Correct path for uploads
  },
  filename: (req, file, cb) => {
    cb(null, req.user._id + path.extname(file.originalname)); // ✅ Store with user ID
  },
});

const upload = multer({ storage }); // ✅ Define upload before using it

// Upload Profile Picture Route
router.put("/upload-profile-pic", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    console.log("📡 Upload request received");
    console.log("👤 User ID:", req.user?._id);
    console.log("📂 Uploaded file:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    console.log("✅ Profile updated:", user.profilePic);
    res.json({ message: "Profile picture updated!", profilePic: user.profilePic });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Update Profile Route
router.put("/update", authMiddleware, async (req, res) => {
  try {
    console.log("📥 Update request received:", req.body);
    const { name, password, bio, fitnessGoal, profilePic } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (bio) user.bio = bio;
    if (fitnessGoal) user.fitnessGoal = fitnessGoal;
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    console.log("✅ Updated user:", user);

      res.json({ 
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio, // ✅ Send bio
      fitnessGoal: user.fitnessGoal, // ✅ Send fitnessGoal
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// In routes/user.js
router.post("/fcm-token", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      fcmToken: req.body.token,
    }, { new: true }); // optional: return the updated user

    console.log("✅ FCM token saved for:", user.email, "| Token:", user.fcmToken);

    res.status(200).json({ message: "FCM token saved" });
  } catch (error) {
    console.error("❌ Failed to save token:", error);
    res.status(500).json({ error: "Failed to save token" });
  }
});

// Get Notification Settings Route
router.get("/settings", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      notificationsEnabled: user.notificationsEnabled,
    });
  } catch (error) {
    console.error("❌ Failed to fetch settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Save Notification Settings Route
router.put("/settings", authMiddleware, async (req, res) => {
  try {
    const { notificationsEnabled } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Save notificationsEnabled to user model
    user.notificationsEnabled = notificationsEnabled;
    await user.save();

    console.log("✅ Settings updated:", user.notificationsEnabled);
    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("❌ Failed to update settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
