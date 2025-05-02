// notifications.js
const express = require("express");
const router = express.Router();
const admin = require("../firebaseAdmin"); // make sure path is correct
const { userTokens } = require("./fcm"); // adjust if needed

router.post("/send-notification", async (req, res) => {
  const { userId, title, body } = req.body;

  const token = userTokens.get(userId);
  if (!token) {
    return res.status(404).json({ message: "No FCM token found for this user" });
  }

  const message = {
    token: token,
    notification: {
      title: title || "Hello!",
      body: body || "This is a test message",
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    res.status(200).json({ message: "Notification sent", response });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

module.exports = router;
