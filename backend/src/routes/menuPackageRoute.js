const express = require("express");
const router = express.Router();
const menuPackageController = require("../controllers/menuPackageController");
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/package-images/');
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'package-' + uniqueSuffix + path.extname(file.originalname));
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

router.post("/", upload.single('image'), menuPackageController.createMenuPackage);
router.get("/", menuPackageController.getAllMenuPackages);
router.get("/:id", menuPackageController.getMenuPackageById);
router.put("/:id", upload.single('image'), menuPackageController.updateMenuPackage);
router.delete("/:id", menuPackageController.deleteMenuPackage);

module.exports = router;
