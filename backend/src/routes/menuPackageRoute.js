const express = require("express");
const router = express.Router();
const menuPackageController = require("../controllers/menuPackageController");

router.post("/", menuPackageController.createMenuPackage);
router.get("/", menuPackageController.getAllMenuPackages);
router.get("/:id", menuPackageController.getMenuPackageById);
router.put("/:id", menuPackageController.updateMenuPackage);
router.delete("/:id", menuPackageController.deleteMenuPackage);

module.exports = router;
