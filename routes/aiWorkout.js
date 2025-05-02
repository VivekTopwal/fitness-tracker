const express = require("express");
const router = express.Router();
const generateWorkoutPlan = require("../ai/aiWorkoutPlanner");

router.post("/generate", async (req, res) => {
  try {
    const userProfile = req.body;
    const plan = await generateWorkoutPlan(userProfile);

    res.json({ success: true, plan });
  } catch (error) {
    console.error("Gemini AI Error:", error?.response?.data || error.message || error);
    res.status(500).json({ success: false, error: "Failed to generate workout plan." });
  }
  
});


module.exports = router;
