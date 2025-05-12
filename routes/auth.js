const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Token = require("../models/Token");
const { authMiddleware, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Generate Access Token (15 mins)
const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Generate Refresh Token (7 days)
const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  await Token.create({ userId: user._id, token: refreshToken });
  return refreshToken;
};

// ✅ Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login Route (returns tokens)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  res.json({
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// ✅ Google Login Route
router.post("/google-login", async (req, res) => {
  const { email, name, avatar, uid } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ message: "Missing Google account info." });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        avatar,
        authType: "google",
        password: await bcrypt.hash(uid, 10),
      });
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Refresh Token Route
router.post("/refresh", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const storedToken = await Token.findOne({ token });
    if (!storedToken || storedToken.token !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const newAccessToken = generateAccessToken({ _id: decoded._id, role: decoded.role });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// ✅ Logout Route
router.post("/logout", async (req, res) => {
  const { token } = req.body;
  await Token.findOneAndDelete({ token });
  res.json({ message: "Logged out successfully" });
});

// ✅ Admin Protected Route (example)
router.get("/admin-dashboard", authMiddleware, isAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

module.exports = router;
