// fcm.js
const express = require("express");
const admin = require("../firebaseAdmin")
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Dummy store for tokens (replace with DB if needed)
const userTokens = new Map();

/**
 * Save FCM token for a user
 */
router.post("/save-token", authMiddleware, (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "FCM token is required" });
  }

  userTokens.set(req.user._id.toString(), token);
  console.log(`✅ Saved FCM token for ${req.user._id}: ${token}`);
  res.json({ message: "Token saved" });
});

/**
 * Send notification to a specific user by their ID
 */
router.post("/send-notification", authMiddleware, async (req, res) => {
  const { userId, title, body } = req.body;
  const token = userTokens.get(userId);

  if (!token) {
    return res.status(404).json({ message: "FCM token not found for user" });
  }

  const message = {
    notification: { title, body },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    res.json({ message: "Notification sent", response });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification", details: error.message });
  }
});

module.exports = router;
