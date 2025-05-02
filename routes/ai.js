const express = require("express");
const router = express.Router();
const { getWorkoutSuggestion } = require("../controllers/aiController");

router.post("/suggest-workout", getWorkoutSuggestion);

module.exports = router;