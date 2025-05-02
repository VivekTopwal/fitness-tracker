const generateWorkoutPlan = require("../ai/workoutPlanner");

const getWorkoutSuggestion = async (req, res) => {
  const { goal, level, equipment, daysPerWeek } = req.body;

  if (!goal || !level || !equipment || !daysPerWeek) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const plan = await generateWorkoutPlan({ goal, level, equipment, daysPerWeek });
    res.json({ plan });
  } catch (error) {
    console.error("❌ AI Suggestion Error:", error);
    res.status(500).json({ error: "Failed to generate workout plan." });
  }
};

module.exports = { getWorkoutSuggestion };