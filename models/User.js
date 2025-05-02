const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fcmToken: String,
  password: { type: String, required: true },
  bio: { type: String, default: "" },  // ✅ Ensure bio exists
  fitnessGoal: { type: String, default: "" },  // ✅ Ensure fitnessGoal exists
  profilePic: { type: String, default: "/default-profile.png" },
  createdAt: { type: Date, default: Date.now },
  fcmToken: { type: String, default: null },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  savedMealPlans: [
    {
      plan: String,
      createdAt: Date,
    }
  ],
  updatedAt: { type: Date, default: Date.now } // ✅ Profile Picture Support
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
