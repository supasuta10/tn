const mongoose = require("mongoose");
const Decimal128 = mongoose.Types.Decimal128; 

const menuPackageSchema = new mongoose.Schema(
  {
    name: { 
        type: String,
        required: [true, "Package name is required"],
        trim: true,
        unique: true
    },

    price: {
      type: Decimal128, 
      required: true, 
      unique: true, // ราคาต่อโต๊ะ (เช่น 1800.00)
    },

    // รายการเมนูทั้งหมดที่ package นี้ "รวมถึง" (References to Menu)
    menus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],

    // จำนวนเมนูที่ลูกค้าเลือกได้ (default = 8)
    maxSelect: {
      type: Number,
      default: 8,
      min: 1
    },

    extraMenuPrice: { 
      type: Decimal128,
      default: 200,
    },
    
    description: {
        type: String,
        default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuPackage", menuPackageSchema);