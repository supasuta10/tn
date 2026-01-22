const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = require('express').Router();

// Utility: async wrapper
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ===========================
    USER (SELF) — Auth required
=========================== */

// GET: my profile
router.get('/me', authenticateToken, asyncHandler(userController.getUserInfo));

// UPDATE: my profile
router.put('/me', authenticateToken, asyncHandler(userController.updateProfile));


/* ===========================
    ADMIN AREA — Protected with admin role
=========================== */

// GET all users
router.get('/all', authenticateToken, adminAuth, asyncHandler(userController.getAllUsers));

// Search users by role
router.get('/search', authenticateToken, adminAuth, asyncHandler(userController.searchUserByRole));

// GET: users with booking counts and VIP status (admin only) - PLACE BEFORE :id ROUTE
router.get('/with-booking-counts', authenticateToken, adminAuth, asyncHandler(userController.getUsersWithBookingCounts));

// Create user (admin only)
router.post('/', authenticateToken, adminAuth, asyncHandler(userController.createUser));

// Get user by ID
router.get('/:id', authenticateToken, adminAuth, asyncHandler(userController.getUserById));

// Update user by ID
router.put('/:id', authenticateToken, adminAuth, asyncHandler(userController.updateUser));

// Toggle user status (activate/deactivate)
router.patch('/:id/toggle-status', authenticateToken, adminAuth, asyncHandler(userController.toggleUserStatus));

// Delete user by ID
router.delete('/:id', authenticateToken, adminAuth, asyncHandler(userController.deleteUser));

module.exports = router;
