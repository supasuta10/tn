const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const customerController = require("../controllers/customerController");
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // You'll need to create this directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-slip-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('เฉพาะไฟล์รูปภาพเท่านั้นที่อนุญาต'), false);
        }
    }
});

// Utility: async wrapper
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ===========================
    CUSTOMER DASHBOARD — Auth required
=========================== */

// GET: customer dashboard summary
router.get('/dashboard', authenticateToken, asyncHandler(customerController.getCustomerDashboardSummary));

// GET: customer bookings
router.get('/bookings', authenticateToken, asyncHandler(customerController.getCustomerBookings));

// GET: customer profile
router.get('/profile', authenticateToken, asyncHandler(customerController.getCustomerProfile));

// PUT: update customer profile
router.put('/profile', authenticateToken, asyncHandler(customerController.updateCustomerProfile));

// DELETE: cancel customer booking
router.delete('/booking/:id', authenticateToken, asyncHandler(customerController.cancelCustomerBooking));

// PUT: update customer booking menu sets
router.put('/booking/:id/menu-sets', authenticateToken, asyncHandler(customerController.updateBookingMenuSets));

// POST: submit payment for customer booking
router.post('/booking/:id/payment', authenticateToken, upload.single('file'), asyncHandler(customerController.submitPaymentForBooking));

module.exports = router;