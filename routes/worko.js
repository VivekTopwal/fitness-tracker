const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");
const authMiddleware = require("../middleware/authMiddleware");
const sendNotification = require("../utils/sendNotification");
const User = require("../models/User");

// 🔐 Add a new workout
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { exercise, sets, reps, weight } = req.body;

    // 🔥 Estimate calories burned (basic formula)
    const calories = sets * reps * weight * 0.1;

    const workout = new Workout({
      userId: req.user._id,
      exercise,
      sets,
      reps,
      weight,
      calories,
    });

    await workout.save();

    // ✅ Send FCM notification before response
    const user = await User.findById(req.user._id);
    console.log("🧪 User FCM Token:", user?.fcmToken);
    
    if (user?.fcmToken) {
      await sendNotification(user.fcmToken, "New Activity Logged", "You just added a new workout!");
    }
    

    res.status(201).json(workout);
  } catch (err) {
    console.error("❌ Failed to save workout:", err);
    res.status(500).json({ message: "Failed to save workout", error: err.message });
  }
});

// 📦 Get all workouts for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workouts", error: err });
  }
});

// ✏️ Update a workout
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: "Failed to update workout", error: err });
  }
});

// 🗑️ Delete a workout
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    res.json({ message: "Workout deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete workout", error: err });
  }
});

module.exports = router;
