const mongoose = require('mongoose');
const BookingModel = require("../models/bookingModel");
const MenuPackageModel = require("../models/menuPackageModel");
const { sendLineMessage } = require('../middleware/lineMessage');
const { LINE_USER_ID } = require('../utils/constants');

// สร้าง Booking
exports.createBooking = async (req, res) => {
  try {
    const {
      customer: customerInfo,
      packageId,
      event_datetime,
      table_count,
      location,
      menu_sets,
      specialRequest,
      deposit_required
    } = req.body;

    // ตรวจสอบ Package
    const menuPackage = await MenuPackageModel.findById(packageId);
    if (!menuPackage) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจเมนู" });
    }

    const price = parseFloat(menuPackage.price.toString());
    let totalPrice = price * table_count; // Base price

    // Calculate additional cost for menus beyond the included 8
    if (menu_sets && menu_sets.length > 0) {
        const includedMenus = menuPackage.maxSelect || 8; // Default to 8 if not specified
        if (menu_sets.length > includedMenus) {
            const extraMenus = menu_sets.length - includedMenus;
            const extraMenuPrice = parseFloat(menuPackage.extraMenuPrice || 200); // Default to 200 if not specified
            const extraCost = extraMenus * extraMenuPrice * table_count; // 200 THB per extra menu per table
            totalPrice += extraCost;
        }
    }

    const pricePerTable = new mongoose.Types.Decimal128(price.toString());
    const totalPriceDecimal = new mongoose.Types.Decimal128(totalPrice.toString());

    const depositRequired = deposit_required
      ? new mongoose.Types.Decimal128(deposit_required.toString())
      : new mongoose.Types.Decimal128((totalPrice * 0.30).toString());

    // Generate booking code
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-${year}${month}${day}${randomNum}`;

    const booking = await BookingModel.create({
      customer: {
        customerID: customerInfo.customerID,
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email
      },
      package: {
        packageID: menuPackage._id,
        package_name: menuPackage.name,
        price_per_table: pricePerTable
      },
      event_datetime,
      table_count,
      location,
      menu_sets: menu_sets || [],
      specialRequest: specialRequest || "",
      deposit_required: depositRequired,
      total_price: totalPriceDecimal,
      booking_date: new Date(),
      bookingCode: bookingCode
    });

    const locationText =
      typeof location === "string"
        ? location
        : `${location.address || ""} `.trim();

    const message =
      `📌 รายการจองใหม่!\n\n` +
      `🔖 Booking Code: ${booking.bookingCode}\n` +
      `👤 ลูกค้า: ${booking.customer.name}\n` +
      `📞 เบอร์: ${booking.customer.phone}\n` +
      `📦 แพ็กเกจ: ${menuPackage.name}\n` +
      `🍽 จำนวนโต๊ะ: ${table_count}\n` +
      `📅 วันงาน: ${new Date(event_datetime).toLocaleString("th-TH")}\n` +
      `💵 รวม: ${totalPrice.toLocaleString()} บาท\n` +
      `💰 มัดจำ: ${parseFloat(depositRequired.toString())} บาท\n` +
      `📍 สถานที่: ${locationText}`;;

    // console.log(message)
    await sendLineMessage(LINE_USER_ID, message);

    res.status(201).json({
      message: "สร้างการจองสำเร็จ",
      data: booking
    });

  } catch (error) {
    console.error("createBooking Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ดึง Booking ทั้งหมด
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.find()
      .populate("customer.customerID", "name email phone")
      .populate("package.packageID")
      .sort({ createdAt: -1 }); // เรียงลำดับจากใหม่ไปเก่า (ล่าสุดขึ้นก่อน)

    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error("getAllBookings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ดึง Booking ตาม ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id)
      .populate("customer.customerID", "name email phone")
      .populate("package.packageID");

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }

    // // Check if the user is the owner of the booking or an admin
    // const isOwner = booking.customer.customerID.toString() === req.user._id.toString();
    // const isAdmin = req.user.role === 'admin';

    // if (!isOwner && !isAdmin) {
    //   return res.status(403).json({ message: "Access denied. You can only access your own bookings." });
    // }

    res.status(200).json({ data: booking });
  } catch (error) {
    console.error("getBookingById Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, amount, slip_image, payment_type } = req.body;
    const booking = await BookingModel.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }

    // อัปเดตสถานะหลัก
    booking.payment_status = status;

    // ถ้ามีการชำระเงิน → push ลง payments[]
    if (amount) {
      booking.payments.push({
        payment_date: new Date(),
        amount: new mongoose.Types.Decimal128(amount.toString()),
        payment_type: payment_type || "deposit",
        slip_image: slip_image || null  // This should be the path to the uploaded file
      });
    }

    // ---- ส่ง LINE เมื่อยกเลิกการจอง ----
    if (status === "cancelled" || status === "ยกเลิก") {

      const cancelMessage =
        `❌ ยกเลิกการจองแล้ว\n\n` +
        `🔖 Booking Code: ${booking.bookingCode}\n` +
        `👤 ลูกค้า: ${booking.customer.name}\n` +
        `📞 เบอร์: ${booking.customer.phone}\n` +
        `📅 วันงาน: ${new Date(booking.event_datetime).toLocaleString("th-TH")}`;

      await sendLineMessage(LINE_USER_ID, cancelMessage);
    }

    await booking.save();

    res.status(200).json({
      message: "อัปเดตสถานะการจองสำเร็จ",
      data: booking
    });

  } catch (error) {
    console.error("updateBookingStatus Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ดึง availability ตามวันที่ (สำหรับเช็คว่าวันไหนเต็มบ้าง)
exports.getDateAvailability = async (req, res) => {
  try {
    // ดึง booking ที่ไม่ถูกยกเลิกทั้งหมด
    const bookings = await BookingModel.find({
      payment_status: { $ne: 'cancelled' } // ไม่รวม booking ที่ถูกยกเลิก
    });

    // นับจำนวน booking ต่อวัน
    const dateCounts = {};
    bookings.forEach(booking => {
      // แปลงวันที่และเวลาเป็นวันที่ตามเขตเวลาท้องถิ่นของประเทศไทย (UTC+7)
      const eventDateTime = new Date(booking.event_datetime);

      // ใช้ toLocaleDateString เพื่อแปลงเป็นวันที่ตามเขตเวลาที่ระบุ
      // ซึ่งจะแปลงเวลา UTC เป็นเวลาท้องถิ่นของประเทศไทย
      const dateKey = eventDateTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

      if (dateCounts[dateKey]) {
        dateCounts[dateKey]++;
      } else {
        dateCounts[dateKey] = 1;
      }
    });

    res.status(200).json({
      data: dateCounts
    });
  } catch (error) {
    console.error("getDateAvailability Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// อัปเดตรายการอาหารของ booking
exports.updateBookingMenuSets = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_sets } = req.body;

    // ตรวจสอบ booking
    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }

    // ตรวจสอบ menu package เพื่อเข้าถึงข้อมูล maxSelect และ extraMenuPrice
    const menuPackage = await MenuPackageModel.findById(booking.package.packageID);
    if (!menuPackage) {
      return res.status(404).json({ message: "ไม่พบข้อมูลแพ็กเกจเมนู" });
    }

    // ตรวจสอบจำนวนเมนูที่เลือก
    const totalSelected = Array.isArray(menu_sets) ? menu_sets.length : 0;
    const maxSelect = menuPackage.maxSelect || 8;
    const extraMenuPrice = parseFloat(menuPackage.extraMenuPrice || 200);

    // ตรวจสอบว่าเลือกเกินจำนวนที่อนุญาตไหม
    // ตรวจสอบราคาแพ็กเกจเพื่อจำกัดจำนวนเมนูพิเศษ
    const packagePrice = parseFloat(menuPackage.price.toString());
    const isSpecialRange = packagePrice >= 3000 && packagePrice <= 3500;
    const maxAllowed = isSpecialRange ? maxSelect + 3 : maxSelect + 2; // สำหรับช่วง 3000-3500 อนุญาตให้เลือกได้มากขึ้น

    if (totalSelected > maxAllowed) {
      return res.status(400).json({
        message: isSpecialRange
          ? `สามารถเลือกเมนูได้สูงสุด ${maxAllowed} อย่าง (แพ็กเกจปกติ ${maxSelect} อย่าง + เมนูพิเศษ 1 อย่าง + เพิ่มได้อีก 2 อย่าง)`
          : `สามารถเลือกเมนูได้สูงสุด ${maxAllowed} อย่าง (แพ็กเกจปกติ ${maxSelect} อย่าง + เพิ่มได้อีก 2 อย่าง)`
      });
    }

    // อัปเดต menu_sets ใน booking
    booking.menu_sets = menu_sets || [];

    // คำนวณราคารวมใหม่ถ้ามีการเพิ่มเมนูเกินที่แพ็กเกจให้
    // ถ้าเลือกเกิน maxSelect ให้คิดเพิ่ม extraMenuPrice ต่อเมนู คูณตามจำนวนโต๊ะ
    let totalPrice = parseFloat(booking.package.price_per_table.toString()) * booking.table_count;

    if (totalSelected > maxSelect) {
      const extraMenus = totalSelected - maxSelect;
      const extraCost = extraMenus * extraMenuPrice * booking.table_count;
      totalPrice += extraCost;
    }

    // คำนวณราคารวมใหม่ (ราคาต่อโต๊ะ + ค่าเมนูเพิ่มเติม) * จำนวนโต๊ะ
    booking.total_price = new mongoose.Types.Decimal128(totalPrice.toString());

    await booking.save();

    res.status(200).json({
      message: "อัปเดตรายการอาหารสำเร็จ",
      data: booking
    });

  } catch (error) {
    console.error("updateBookingMenuSets Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ลบ Booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่า booking มีอยู่จริงหรือไม่
    const booking = await BookingModel.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }

    // ลบ booking ออกจากฐานข้อมูล
    const deletedBooking = await BookingModel.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }

    res.status(200).json({
      message: "ลบการจองสำเร็จ",
      data: deletedBooking
    });

  } catch (error) {
    console.error("deleteBooking Error:", error);
    res.status(500).json({ message: error.message });
  }
};
