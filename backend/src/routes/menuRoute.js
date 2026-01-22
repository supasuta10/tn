const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/menu-images/'); // Create this directory
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu-item-' + uniqueSuffix + path.extname(file.originalname));
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

// POST: Create menu with optional image
router.post("/", upload.single('image'), menuController.createMenuWithImage);

// GET: Get all menus
router.get("/", menuController.getAllMenus);

// GET: Get menu by ID
router.get("/:id", menuController.getMenuById);

// PUT: Update menu with optional image
router.put("/:id", upload.single('image'), menuController.updateMenuWithImage);

// DELETE: Delete menu
router.delete("/:id", menuController.deleteMenu);

// Soft delete
router.patch("/:id/toggle", menuController.toggleActive);

module.exports = router;
