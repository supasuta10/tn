const menuPackageModel = require("../models/menuPackageModel");

// สร้าง MenuPackage ใหม่
exports.createMenuPackage = async (req, res) => {
  try {
    const { name, price, menus, maxSelect, extraMenuPrice, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "ต้องระบุชื่อแพ็กเกจ" });
    }

    if (!price) {
      return res.status(400).json({ message: "ต้องระบุราคาแพ็กเกจ" });
    }

    // ตรวจสอบว่า name หรือ price ซ้ำไหม
    const existsByName = await menuPackageModel.findOne({ name });
    const existsByPrice = await menuPackageModel.findOne({ price });

    if (existsByName) {
      return res.status(400).json({ message: "ชื่อแพ็กเกจนี้มีอยู่แล้ว" });
    }

    if (existsByPrice) {
      return res.status(400).json({ message: "ราคานี้มีอยู่แล้ว" });
    }

    // สร้าง package
    const menuPackage = await menuPackageModel.create({
      name,
      price,
      menus,
      maxSelect,
      extraMenuPrice,
      description
    });

    res.status(201).json({ message: "สร้างแพ็กเกจเมนูสำเร็จ", data: menuPackage });
  } catch (error) {
    console.error("createMenuPackage Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// อ่าน MenuPackage ทั้งหมด + filter
exports.getAllMenuPackages = async (req, res) => {
  try {
    const { search, minPrice, maxPrice } = req.query;

    let filter = {};

    // ถ้ามีการค้นหา ให้ค้นหาทั้งชื่อและราคา
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { price: { $regex: search, $options: "i" } }
      ];
    }

    // สร้าง price filter object แยก
    let priceFilter = {};
    if (minPrice !== undefined) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      priceFilter.$lte = Number(maxPrice);
    }

    // ถ้ามี price filter อย่างน้อยหนึ่งเงื่อนไข
    if (Object.keys(priceFilter).length > 0) {
      // ถ้า filter ว่างเปล่า (ไม่มี search) ให้กำหนด price filter โดยตรง
      // ถ้า filter มีค่าอยู่แล้ว (จาก search) ให้เพิ่มเข้าไปใน $and
      if (Object.keys(filter).length === 0) {
        filter.price = priceFilter;
      } else {
        // ถ้ามี filter จาก search แล้ว ให้ใช้ $and
        filter = {
          $and: [
            filter,
            { price: priceFilter }
          ]
        };
      }
    }

    const packages = await menuPackageModel.find(filter)
      .populate("menus") // แสดงรายละเอียด menu ด้วย
      .sort({ createdAt: -1 });

    res.status(200).json({ data: packages });
  } catch (error) {
    console.error("getAllMenuPackages Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// อ่าน MenuPackage ตาม ID
exports.getMenuPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const menuPackage = await menuPackageModel.findById(id).populate("menus");
    if (!menuPackage) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจเมนู" });
    }
    res.status(200).json({ data: menuPackage });
  } catch (error) {
    console.error("getMenuPackageById Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// อัปเดต MenuPackage
exports.updateMenuPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // ตรวจสอบว่ามีการอัปเดต name หรือไม่
    if (updateData.name) {
      // ตรวจสอบว่า name นี้มีอยู่แล้วหรือไม่ (เว้นแต่จะเป็น record เดียวกัน)
      const existingPackage = await menuPackageModel.findOne({
        name: updateData.name,
        _id: { $ne: id }
      });

      if (existingPackage) {
        return res.status(400).json({ message: "ชื่อแพ็กเกจนี้มีอยู่แล้ว" });
      }
    }

    // ถ้ามีการอัปเดต price ต้องตรวจสอบว่าไม่ซ้ำกับ record อื่น
    if (updateData.price !== undefined) {
      const existingPackage = await menuPackageModel.findOne({
        price: updateData.price,
        _id: { $ne: id }
      });

      if (existingPackage) {
        return res.status(400).json({ message: "ราคานี้มีอยู่แล้ว" });
      }
    }

    const menuPackage = await menuPackageModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!menuPackage) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจเมนู" });
    }

    res.status(200).json({ message: "อัปเดตแพ็กเกจเมนูสำเร็จ", data: menuPackage });
  } catch (error) {
    console.error("updateMenuPackage Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ลบ MenuPackage
exports.deleteMenuPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const menuPackage = await menuPackageModel.findByIdAndDelete(id);
    if (!menuPackage) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจเมนู" });
    }
    res.status(200).json({ message: "ลบแพ็กเกจเมนูสำเร็จ" });
  } catch (error) {
    console.error("deleteMenuPackage Error:", error);
    res.status(500).json({ message: error.message });
  }
};

