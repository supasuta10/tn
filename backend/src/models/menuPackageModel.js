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

    // Categories configuration
    categories: [
      {
        name: {
          type: String,
          required: true,
          enum: ["appetizer", "special", "soup", "maincourse", "carb", "curry", "dessert"]
        }, // e.g., "appetizer"
        quota: {
          type: Number,
          default: 1,
          min: 0
        },
        extraPrice: {
          type: Number,
          default: 200,
          min: 0
        },
        items: [
          {
            menu: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Menu"
            },
            isDefault: {
              type: Boolean,
              default: false
            }
          }
        ]
      }
    ],

    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuPackage", menuPackageSchema);