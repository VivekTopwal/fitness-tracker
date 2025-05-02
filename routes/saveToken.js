// routes/saveToken.js
const express = require("express");
const router = express.Router();
const userTokens = new Map();

router.post("/save-token", (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: "Missing userId or token" });
  }

  userTokens.set(userId, token);
  console.log(`✅ Token saved for user ${userId}: ${token}`);
  res.status(200).json({ message: "Token saved successfully" });
});

module.exports = { router, userTokens };
