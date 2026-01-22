const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Utility: async wrapper
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// POST: create booking (available to customers)
router.post("/", authenticateToken, asyncHandler(bookingController.createBooking));

// GET: all bookings (admin only)
router.get("/", authenticateToken, adminAuth, asyncHandler(bookingController.getAllBookings));

// GET: date availability (available to public)
router.get("/availability", asyncHandler(bookingController.getDateAvailability));

// GET: booking by ID (customer or admin)
router.get("/:id", authenticateToken, asyncHandler(bookingController.getBookingById));

// PUT: update booking status (admin only)
router.put("/:id/status", authenticateToken, adminAuth, asyncHandler(bookingController.updateBookingStatus));

// PUT: update booking menu sets (admin only)
router.put("/:id/menu-sets", authenticateToken, adminAuth, asyncHandler(bookingController.updateBookingMenuSets));

// DELETE: delete booking (admin only)
router.delete("/:id", authenticateToken, adminAuth, asyncHandler(bookingController.deleteBooking));

module.exports = router;