const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Fixed destructured import
const { getDashboardData } = require("../controllers/dashboardControllers"); // ✅ Correct Import

const router = express.Router();

// ✅ Apply authMiddleware and handler
router.get("/", authMiddleware, getDashboardData);

module.exports = router;
