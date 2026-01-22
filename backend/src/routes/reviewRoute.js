const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const reviewController = require("../controllers/reviewController");

// สร้าง Review และ ดึง Review ทั้งหมด
router.route("/")
  .post(authenticateToken, reviewController.createReview)
  .get(reviewController.getAllReviews);

// ดึงค่าเฉลี่ยของ Rating (ต้องมาก่อน route ที่ใช้ :id)
router.get("/average-rating", reviewController.getAverageRating);

// ดึง Review ตาม Customer
router.get("/customer/:customerID", authenticateToken, reviewController.getReviewsByCustomer);

// ดึง Review ตาม Booking
router.get("/booking/:bookingID", reviewController.getReviewsByBooking);

// ดึง Review ตาม ID, อัปเดต และ ลบ (ต้องมาหลัง routes ที่เฉพาะเจาะจง)
router.route("/:id")
  .get(reviewController.getReviewById)
  .put(authenticateToken, reviewController.updateReview)
  .delete(authenticateToken, reviewController.deleteReview);

module.exports = router;