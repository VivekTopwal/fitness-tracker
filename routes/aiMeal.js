const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");


const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", async (req, res) => {
  const { goal, cuisine, mealsPerDay } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const prompt = `
You are a certified nutritionist and AI meal planner.
Create a detailed meal plan based on the following:

- Goal: ${goal}
- Preferred cuisine: ${cuisine}
- Meals per day: ${mealsPerDay}

Format it clearly using markdown. Use headings, bullet points, and sections like:
- Breakfast / Lunch / Dinner
- Snacks (if relevant)
- Nutrition tips (optional)
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ plan: text });
  } catch (err) {
    console.error("Gemini Meal Plan Error:", err);
    res.status(500).json({ plan: "⚠️ Failed to generate meal plan." });
  }
});


// Save AI Meal Plan
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ message: "No plan provided." });

    console.log("Authenticated user:", req.user); // 👈 check if this prints anything

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." }); // 👈 add this

    user.savedMealPlans.push({
      plan,
      createdAt: new Date(),
    });

    await user.save();
    res.status(200).json({ message: "Meal plan saved." });
  } catch (err) {
    console.error("Backend save error:", err);
    res.status(500).json({ message: "Failed to save meal plan." });
  }
});

router.get("/saved", authMiddleware,  async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ savedMealPlans: user.savedMealPlans });
   

  } catch (err) {
    console.error("View saved plans error:", err);
    res.status(500).json({ message: "Failed to fetch saved meal plans" });
  }
});


router.delete("/delete/:planId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const planId = req.params.planId;

    user.savedMealPlans = user.savedMealPlans.filter(
      (plan) => plan._id.toString() !== planId
    );

    await user.save();
    res.status(200).json({ message: "Meal plan deleted." });
  } catch (err) {
    console.error("Delete plan error:", err);
    res.status(500).json({ message: "Failed to delete meal plan" });
  }
});

 

module.exports = router;
