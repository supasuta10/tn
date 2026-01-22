const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Utility: async wrapper
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Import admin controllers
const adminController = require("../controllers/adminController");

// ADMIN DASHBOARD — Admin only

// GET: admin dashboard summary
router.get('/dashboard', authenticateToken, adminAuth, asyncHandler(adminController.getAdminDashboardSummary));

// GET: admin analytics data
router.get('/analytics', authenticateToken, adminAuth, asyncHandler(adminController.getAnalytics));

// GET: admin reports
router.get('/reports', authenticateToken, adminAuth, asyncHandler(adminController.getReports));

module.exports = router;