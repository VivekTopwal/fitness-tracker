// ai/aiWorkoutPlanner.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function generateWorkoutPlan(userProfile) {
  const { goal, level, equipment, daysPerWeek } = userProfile;

  const prompt = `
You're a certified personal trainer. Create a ${daysPerWeek}-day personalized workout plan.
User details:
- Goal: ${goal}
- Level: ${level}
- Equipment: ${equipment}

Format like:
Day 1:
- Exercise 1
- Exercise 2
`;

  console.log("🔍 Sending prompt to Gemini...\nPrompt:\n", prompt);

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    console.log("✅ Gemini Response:\n", text);
    return text;
  } catch (error) {
    console.error("❌ Gemini AI Error:", error);
    throw error; // Ensure it triggers 500 in route
  }
}

module.exports = generateWorkoutPlan;
