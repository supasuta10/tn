const menuModel = require("../models/menuModel")
const menuPackageModel = require("../models/menuPackageModel");

exports.createMenu = async (req, res) => {
  try {
    const { code, name, description, category, packages, image, tags } = req.body;

    const exists = await menuModel.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "รหัสเมนูนี้มีอยู่แล้ว" });
    }

    const menu = await menuModel.create({
      code: code.toUpperCase(),
      name,
      description,
      category,
      packages: packages || [],
      image,
      tags,
    });

    // Sync with MenuPackage: Add this menu to selected packages
    if (packages && packages.length > 0) {
      await menuPackageModel.updateMany(
        { _id: { $in: packages } },
        { $addToSet: { menus: menu._id } }
      );
    }

    res.status(201).json({ message: "สร้างเมนูสำเร็จ", data: menu });
  } catch (error) {
    console.error("createMenu Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📸 Create menu with image upload
exports.createMenuWithImage = async (req, res) => {
  try {
    const { code, name, description, category, packages, tags } = req.body;

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

    // Parse packages if it comes as string (multipart/form-data)
    let parsedPackages = [];
    if (packages) {
      try {
        parsedPackages = typeof packages === 'string' ? JSON.parse(packages) : packages;
      } catch (e) {
        console.error("Error parsing packages:", e);
        parsedPackages = [];
      }
    }

    const menu = await menuModel.create({
      code: code.toUpperCase(),
      name,
      description,
      category,
      packages: parsedPackages,
      image: imageUrl, // Save the image path
      tags,
    });

    // Sync with MenuPackage: Add this menu to selected packages
    if (parsedPackages && parsedPackages.length > 0) {
      await menuPackageModel.updateMany(
        { _id: { $in: parsedPackages } },
        { $addToSet: { menus: menu._id } }
      );
    }

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

    const menus = await menuModel.find(filter).sort({ createdAt: -1 }).populate('packages', 'name');

    res.status(200).json({ count: menus.length, data: menus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 ดึงเมนูเดียว
exports.getMenuById = async (req, res) => {
  try {
    const menu = await menuModel.findById(req.params.id).populate('packages', 'name');

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
    const { packages } = req.body;

    const oldMenu = await menuModel.findById(id);
    if (!oldMenu) return res.status(404).json({ message: "ไม่พบเมนู" });

    const updatedMenu = await menuModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // 🔄 Sync packages if they were updated
    if (packages !== undefined) {
      // 1. Remove menu from packages that are NO LONGER in the list
      // diff: oldPackages - newPackages
      const oldPackageIds = oldMenu.packages.map(p => p.toString());
      const newPackageIds = packages; // array of strings

      const toRemove = oldPackageIds.filter(pid => !newPackageIds.includes(pid));
      const toAdd = newPackageIds.filter(pid => !oldPackageIds.includes(pid));

      if (toRemove.length > 0) {
        await menuPackageModel.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { menus: id } }
        );
      }

      if (toAdd.length > 0) {
        await menuPackageModel.updateMany(
          { _id: { $in: toAdd } },
          { $addToSet: { menus: id } }
        );
      }
    }

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
    const { code, name, description, category, packages, tags } = req.body;

    // Parse packages
    let parsedPackages = [];
    if (packages) {
      try {
        parsedPackages = typeof packages === 'string' ? JSON.parse(packages) : packages;
      } catch (e) {
        console.error("Error parsing packages in update:", e);
      }
    }

    // Prepare update data
    const updateData = {
      code: code ? code.toUpperCase() : existingMenu.code,
      name: name || existingMenu.name,
      description: description || existingMenu.description,
      category: category || existingMenu.category,
      packages: packages !== undefined ? parsedPackages : existingMenu.packages,
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

    // 🔄 Sync packages
    if (packages !== undefined) {
      const oldPackageIds = existingMenu.packages.map(p => p.toString());
      const newPackageIds = parsedPackages; // array of strings (Ids) or objects? Usually just IDs if passed from client

      const toRemove = oldPackageIds.filter(pid => !newPackageIds.includes(pid));
      const toAdd = newPackageIds.filter(pid => !oldPackageIds.includes(pid));

      if (toRemove.length > 0) {
        await menuPackageModel.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { menus: id } }
        );
      }

      if (toAdd.length > 0) {
        await menuPackageModel.updateMany(
          { _id: { $in: toAdd } },
          { $addToSet: { menus: id } }
        );
      }
    }

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

    // Remove this menu from all packages that have it
    await menuPackageModel.updateMany(
      { menus: id },
      { $pull: { menus: id } }
    );

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
