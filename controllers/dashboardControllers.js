const mongoose = require("mongoose");
const Workout = require("../models/Workout");
const Meal = require("../models/Meal");

const { Types } = mongoose;
const ObjectId = Types.ObjectId;

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalWorkouts = await Workout.countDocuments({ userId });

    const rawWorkouts = await Workout.find({ userId });
    console.log("📦 All user workouts:", rawWorkouts);

    const caloriesBurned = await Workout.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          calories: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$calories" },
        },
      },
    ]);

    console.log("🧪 Aggregating calories for userId:", userId);
    console.log("🔥 Calories Burned Aggregation:", caloriesBurned);

    const activeDays = await Workout.distinct("date", { userId });

    const recentActivityRaw = await Workout.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    const recentActivity = recentActivityRaw.map(w => ({
      id: w._id,
      type: "Workout",
      description: w.exercise || "Workout",
      date: w.date.toISOString().split("T")[0],
    }));

    const dailyWorkoutsRaw = await Workout.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $group: { _id: "$date", workouts: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const dailyWorkouts = dailyWorkoutsRaw.map(entry => ({
      date: entry._id,
      workouts: entry.workouts,
    }));

    const activityDistributionRaw = await Workout.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const activityDistribution = {
      cardio: activityDistributionRaw.find(item => item._id === 'Cardio')?.count || 0,
      strength: activityDistributionRaw.find(item => item._id === 'Strength')?.count || 0,
      flexibility: activityDistributionRaw.find(item => item._id === 'Flexibility')?.count || 0,
    };

    const dashboardData = {
      userStats: {
        totalWorkouts,
        caloriesBurned: caloriesBurned[0]?.totalCalories || 0,
        activeDays: activeDays.length,
      },
      dailyWorkouts,
      recentActivity,
      activityDistribution,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to load dashboard data", error });
  }
};

module.exports = { getDashboardData };
