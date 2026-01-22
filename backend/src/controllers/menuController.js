const menuModel = require("../models/menuModel")

exports.createMenu = async (req, res) => {
  try {
    const { code, name, description, category, packagePrice, image, tags } = req.body;

    const exists = await menuModel.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "รหัสเมนูนี้มีอยู่แล้ว" });
    }

    const menu = await menuModel.create({
      code: code.toUpperCase(),
      name,
      description,
      category,
      packagePrice,
      image,
      tags,
    });

    res.status(201).json({ message: "สร้างเมนูสำเร็จ", data: menu });
  } catch (error) {
    console.error("createMenu Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📸 Create menu with image upload
exports.createMenuWithImage = async (req, res) => {
  try {
    const { code, name, description, category, packagePrice, tags } = req.body;

    // Check if menu with code already exists
    const exists = await menuModel.findOne({ code: code.toUpperCase() });
    if (exists) {
      // Clean up uploaded file if it exists
      if (req.file) {
        const fs = require('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
      return res.status(400).json({ message: "รหัสเมนูนี้มีอยู่แล้ว" });
    }

    // Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/menu-images/${req.file.filename}`;
    }

    const menu = await menuModel.create({
      code: code.toUpperCase(),
      name,
      description,
      category,
      packagePrice,
      image: imageUrl, // Save the image path
      tags,
    });

    res.status(201).json({ message: "สร้างเมนูสำเร็จ", data: menu });
  } catch (error) {
    console.error("createMenuWithImage Error:", error);

    // Clean up uploaded file if it exists and there was an error
    if (req.file) {
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    res.status(500).json({ message: error.message });
  }
};


// 📌 ดึงเมนูทั้งหมด + filter
exports.getAllMenus = async (req, res) => {
  try {
    const { search, category, active, tag } = req.query;

    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    if (tag) {
      filter.tags = tag;
    }

    const menus = await menuModel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ count: menus.length, data: menus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 ดึงเมนูเดียว
exports.getMenuById = async (req, res) => {
  try {
    const menu = await menuModel.findById(req.params.id);

    if (!menu) return res.status(404).json({ message: "ไม่พบเมนู" });

    res.status(200).json({ data: menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 อัปเดตเมนู
exports.updateMenu = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedMenu = await menuModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMenu) {
      return res.status(404).json({ message: "ไม่พบเมนู" });
    }

    res.status(200).json({
      message: "อัปเดตเมนูสำเร็จ",
      data: updatedMenu,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📸 Update menu with image upload
exports.updateMenuWithImage = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the existing menu to get old image path
    const existingMenu = await menuModel.findById(id);
    if (!existingMenu) {
      // Clean up uploaded file if it exists
      if (req.file) {
        const fs = require('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
      return res.status(404).json({ message: "ไม่พบเมนู" });
    }

    // Extract body data excluding the image
    const { code, name, description, category, packagePrice, tags } = req.body;

    // Prepare update data
    const updateData = {
      code: code ? code.toUpperCase() : existingMenu.code,
      name: name || existingMenu.name,
      description: description || existingMenu.description,
      category: category || existingMenu.category,
      packagePrice: packagePrice !== undefined ? packagePrice : existingMenu.packagePrice,
      tags: tags !== undefined ? tags : existingMenu.tags
    };

    // Handle new image upload
    if (req.file) {
      // Delete old image file if it exists
      if (existingMenu.image) {
        const fs = require('fs');
        const oldImagePath = `.${existingMenu.image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.image = `/uploads/menu-images/${req.file.filename}`;
    }

    const updatedMenu = await menuModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "อัปเดตเมนูสำเร็จ",
      data: updatedMenu,
    });
  } catch (error) {
    console.error("updateMenuWithImage Error:", error);

    // Clean up uploaded file if it exists and there was an error after validation
    if (req.file) {
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    res.status(500).json({ message: error.message });
  }
};

// 📌 ลบเมนู (hard delete)
exports.deleteMenu = async (req, res) => {
  try {
    const id = req.params.id;

    const menuToDelete = await menuModel.findById(id);
    if (!menuToDelete) {
      return res.status(404).json({ message: "ไม่พบเมนู" });
    }

    // Delete the image file if it exists
    if (menuToDelete.image) {
      const fs = require('fs');
      const imagePath = `.${menuToDelete.image}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const deleted = await menuModel.findByIdAndDelete(id);

    res.status(200).json({ message: "ลบเมนูสำเร็จ", data: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 soft delete (เปลี่ยน active)
exports.toggleActive = async (req, res) => {
  try {
    const id = req.params.id;

    const menu = await menuModel.findById(id);
    if (!menu) return res.status(404).json({ message: "ไม่พบเมนู" });

    menu.active = !menu.active;
    await menu.save();

    res.status(200).json({
      message: `เมนูตอนนี้ ${menu.active ? "ใช้งานอยู่" : "ไม่ใช้งาน"}`,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
