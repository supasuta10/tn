const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for payment slip uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/payment-slips/'); // Create this directory for payment slips
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-slip-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for payment slips
    },
    fileFilter: (req, file, cb) => {
        // Accept image and PDF files for payment slips
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('เฉพาะไฟล์รูปภาพหรือ PDF เท่านั้นที่อนุญาตสำหรับหลักฐานการชำระเงิน'), false);
        }
    }
});

// POST: Upload payment slip
router.post("/upload", upload.single('slip'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "ไม่มีไฟล์ที่อัปโหลด" });
    }

    // Return the path to the uploaded file
    res.status(200).json({
        message: "อัปโหลดหลักฐานการชำระเงินเรียบร้อยแล้ว",
        filePath: `/uploads/payment-slips/${req.file.filename}`,
        filename: req.file.filename
    });
});

module.exports = router;