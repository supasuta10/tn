const mongoose = require("mongoose");
const Decimal128 = mongoose.Types.Decimal128;

const categoryList = ["appetizer", "maincourse", "carb", "soup", "curry", "dessert"];

const menuSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Menu code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Menu name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    category: {
      type: String,
      required: true,
      enum: categoryList,
      index: true,
    },
 
     // ราคาจัดชุด (ใช้ในโต๊ะจีน)
    packagePrice: {
      type: Decimal128,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    // เช่น "popular", "recommend", "spicy"
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Menu", menuSchema);
