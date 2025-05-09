require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
require("./cron/reminderScheduler");

const bodyParser = require("body-parser");  // Optional if using express.json()
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// 🔁 Your combined FCM routes (tokens + notifications)
const fcmRoutes = require("./routes/fcm");

// Other app routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/user");
const workoutRoutes = require("./routes/worko");
const mealRoutes = require("./routes/meals");
const aiWorkoutRoutes = require("./routes/aiWorkout");
const aiRoutes = require("./routes/ai");
const aiMealRoutes = require("./routes/aiMeal");

const app = express();


// Allow CORS from your frontend domain
const allowedOrigins = [
  "http://localhost:3000",
  "https://fitness-tracker-frontend-alpha.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// Use either bodyParser.json() or express.json(), not both
app.use(express.json());
// If you prefer bodyParser (or need special options), you could use:
// app.use(bodyParser.json());

// ✅ Serve uploaded images
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/fcm", fcmRoutes); // only this needed for FCM
app.use("/api/ai-workout", aiWorkoutRoutes); // ✅ AI Workout Suggestion API
app.use("/api/ai", aiRoutes);
app.use("/api/ai-meal", aiMealRoutes);

console.log("✅ aiMealRoutes loaded");

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("🚀 Fitness Tracker API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
