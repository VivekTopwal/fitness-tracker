const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Token = require("../models/Token"); // ✅ New model for refresh tokens
const { authMiddleware, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Function to generate access token (valid for 15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role }, // ✅ Use _id instead of id
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Function to generate refresh token (valid for 7 days)
const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await Token.create({ userId: user._id, token: refreshToken }); // ✅ Store refresh token in DB
  return refreshToken;
};

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: role || "user" });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// POST /api/auth/register
// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
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


// ✅ Login Route (Returns Access & Refresh Tokens)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
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

// ✅ Refresh Token Route
router.post("/refresh", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const storedToken = await Token.findOne({ token });
    if (!storedToken) return res.status(403).json({ message: "Invalid refresh token" });

    const verified = jwt.verify(token, process.env.REFRESH_SECRET);

    // Generate new access token
    const newAccessToken = generateAccessToken({ _id: verified._id, role: verified.role });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// ✅ Logout Route (Removes Refresh Token from DB)
router.post("/logout", async (req, res) => {
  const { token } = req.body;
  await Token.findOneAndDelete({ token }); // ✅ Remove from database
  res.json({ message: "Logged out successfully" });
});

// ✅ Admin Dashboard Route (Protected)
router.get("/admin-dashboard", authMiddleware, isAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

module.exports = router;
