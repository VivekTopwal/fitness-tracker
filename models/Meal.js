const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  mealType: {
    type: String,
    enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
    required: [true, "Meal type is required"],
  },
  description: {
    type: String,
    required: [true, "Meal description is required"],
  },
  calories: {
    type: Number,
    required: [true, "Calories are required"],
  },
  protein: {
    type: Number,
    default: 0,
  },
  carbs: {
    type: Number,
    default: 0,
  },
  fat: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Meal", mealSchema);
