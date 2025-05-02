const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const authMiddleware = require("../middleware/authMiddleware");
const sendNotification = require("../utils/sendNotification");
const User = require("../models/User");

// ➕ Add a meal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { mealType, description, calories, protein, carbs, fat } = req.body;

    const newMeal = new Meal({
      userId: req.user._id,
      mealType,
      description,
      calories,
      protein,
      carbs,
      fat,
    });

    const savedMeal = await newMeal.save();

    // ✅ Fetch user and send notification
    const user = await User.findById(req.user._id);
    console.log("🧪 User FCM Token:", user?.fcmToken);
    
    if (user?.fcmToken) {
      await sendNotification(user.fcmToken, "New Activity Logged", "You just added a new meal!");
    }
    

    res.status(201).json(savedMeal);
  } catch (error) {
    console.error("❌ Error saving meal:", error);
    res.status(500).json({ message: "Failed to add meal", error });
  }
});

// 📦 Get all meals for user (including deleted)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meals", error: err.message });
  }
});

// ♻️ Restore a soft-deleted meal
router.put("/restore/:id", authMiddleware, async (req, res) => {
  try {
    const restoredMeal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );

    if (!restoredMeal) {
      return res.status(404).json({ message: "Meal not found or not deleted" });
    }

    res.json({ message: "Meal restored successfully", meal: restoredMeal });
  } catch (error) {
    console.error("❌ Error restoring meal:", error);
    res.status(500).json({ message: "Failed to restore meal", error });
  }
});

// 🗑️ Permanently delete a soft-deleted meal
router.delete("/permanent/:id", authMiddleware, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: true,
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found or not in trash" });
    }

    res.json({ message: "Meal permanently deleted" });
  } catch (error) {
    console.error("❌ Error permanently deleting meal:", error);
    res.status(500).json({ message: "Failed to permanently delete meal", error });
  }
});

// 🧹 Clear all soft-deleted meals
router.delete("/clear-trash", authMiddleware, async (req, res) => {
  try {
    const result = await Meal.deleteMany({ userId: req.user._id, isDeleted: true });
    res.json({ message: `🧹 ${result.deletedCount} meals permanently deleted from trash` });
  } catch (error) {
    console.error("❌ Error clearing trash:", error);
    res.status(500).json({ message: "Failed to clear trash", error });
  }
});

// 📝 Update a meal
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!updatedMeal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.json(updatedMeal);
  } catch (error) {
    console.error("❌ Error updating meal:", error);
    res.status(500).json({ message: "Failed to update meal", error });
  }
});

// ❌ Soft delete a meal (keep this last!)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedMeal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedMeal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.json({ message: "Meal soft-deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting meal:", error);
    res.status(500).json({ message: "Failed to delete meal", error });
  }
});

module.exports = router;
