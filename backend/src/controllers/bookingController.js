const mongoose = require('mongoose');
const BookingModel = require("../models/bookingModel");
const MenuPackageModel = require("../models/menuPackageModel");
const MenuModel = require("../models/menuModel");
const { sendLineMessage } = require('../middleware/lineMessage');
const { LINE_USER_ID } = require('../utils/constants');
const axios = require('axios');

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

    // Prepare enriched menu sets
    let enrichedMenuSets = [];

    // Calculate additional cost based on localized conditions
    if (menu_sets && menu_sets.length > 0) {
      // Collect all menu names to fetch details
      const menuNames = menu_sets.map(m => m.menu_name);
      // Fetch menu details to get categories
      const foundMenus = await MenuModel.find({ name: { $in: menuNames } });

      // Map name -> menu object for easy lookup
      const menuMap = {};
      foundMenus.forEach(m => {
        menuMap[m.name] = m;
      });

      // Group selected counts by category
      const categoryCounts = {};

      // Process menu_sets to enrich data and count categories
      enrichedMenuSets = menu_sets.map(item => {
        const menuDetails = menuMap[item.menu_name];
        let category = 'unknown';

        if (menuDetails) {
          category = menuDetails.category;
        }

        // Update count
        if (!categoryCounts[category]) categoryCounts[category] = 0;
        categoryCounts[category] += (item.quantity || 1);

        return {
          menuID: menuDetails ? menuDetails._id : null,
          menu_name: item.menu_name,
          category: category,
          quantity: item.quantity || 1
        };
      });

      // Calculate extra cost based on package categories
      if (menuPackage.categories && menuPackage.categories.length > 0) {
        menuPackage.categories.forEach(cat => {
          const quota = cat.quota || 0;
          const extraPrice = parseFloat((cat.extraPrice || 0).toString());

          const selectedCount = categoryCounts[cat.name] || 0;

          if (selectedCount > quota) {
            const extraItems = selectedCount - quota;
            const extraCost = extraItems * extraPrice * table_count;
            totalPrice += extraCost;
          }
        });
      } else if (menuPackage.conditions && menuPackage.conditions.length > 0) {
        // Legacy support for conditions
        menuPackage.conditions.forEach(condition => {
          const cat = condition.category;
          const quota = condition.quota || 0;
          const extraPrice = parseFloat((condition.extraPrice || 0).toString());

          const selectedCount = categoryCounts[cat] || 0;

          if (selectedCount > quota) {
            const extraItems = selectedCount - quota;
            const extraCost = extraItems * extraPrice * table_count;
            totalPrice += extraCost;
          }
        });
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
      menu_sets: enrichedMenuSets.length > 0 ? enrichedMenuSets : (menu_sets || []),
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
    const booking = await BookingModel.findById(req.params.id)
      .populate("customer.customerID", "name email phone") // Populate for webhook
      .populate("package.packageID", "name price categories"); // Populate for webhook

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

// Trigger AI Calculation Manually
exports.triggerAiCalculation = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findById(id)
      .populate("customer.customerID", "name email phone")
      .populate("package.packageID", "name price categories");

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      return res.status(500).json({ message: "N8N_WEBHOOK_URL is not configured" });
    }

    // Enrich menu_sets with descriptions on-the-fly
    const menuNames = booking.menu_sets.map(m => m.menu_name);
    const foundMenus = await MenuModel.find({ name: { $in: menuNames } });
    const menuMap = {};
    foundMenus.forEach(m => { menuMap[m.name] = m; });

    const enrichedMenuSets = booking.menu_sets.map(m => {
      const details = menuMap[m.menu_name];
      return {
        ...m.toObject(),
        description: details ? details.description : ''
      };
    });

    // Prepare payload for n8n AI
    const payload = {
      _id: booking._id,
      bookingCode: booking.bookingCode,
      customer: booking.customer,
      event_datetime: booking.event_datetime,
      location: booking.location,
      menu_sets: enrichedMenuSets,
      table_count: booking.table_count,
      total_price: booking.total_price ? parseFloat(booking.total_price.toString()) : 0,
      payment_status: booking.payment_status,
      timestamp: new Date().toISOString()
    };

    // Fire and forget (or await, here we just trigger it)
    axios.post(n8nUrl, payload)
      .then(response => console.log(`n8n Manual Trigger Success: ${response.status}`))
      .catch(err => console.error(`n8n Manual Trigger Error: ${err.message}`));

    res.status(200).json({ message: "ส่งคำขอคำนวณไปยัง AI แล้ว" });

  } catch (error) {
    console.error("triggerAiCalculation Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// อัปเดตข้อมูล AI Suggestion (สำหรับ n8n callback)
exports.updateAiSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const aiData = req.body; // JSON object from n8n

    console.log("Received AI Suggestion for Booking:", id);

    // Check if id is a valid ObjectId, otherwise treat as bookingCode
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { bookingCode: id };
    }

    const booking = await BookingModel.findOneAndUpdate(
      query,
      { ai_suggestion: aiData },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }

    res.status(200).json({
      message: "อัปเดตข้อมูล AI สำเร็จ",
      data: booking
    });
  } catch (error) {
    console.error("updateAiSuggestion Error:", error);
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

    // ตรวจสอบ menu package เพื่อเข้าถึงข้อมูล conditions
    const menuPackage = await MenuPackageModel.findById(booking.package.packageID);
    if (!menuPackage) {
      return res.status(404).json({ message: "ไม่พบข้อมูลแพ็กเกจเมนู" });
    }

    // ----------------------------------------------------------------------
    // Logic ใหม่: คำนวณตาม Conditions รายหมวดหมู่
    // ----------------------------------------------------------------------

    // 1. Prepare enriched menu sets
    let enrichedMenuSets = [];
    let totalPrice = parseFloat(booking.package.price_per_table.toString()) * booking.table_count;

    if (menu_sets && menu_sets.length > 0) {
      // Collect all menu names to fetch details
      const menuNames = menu_sets.map(m => m.menu_name);
      const foundMenus = await MenuModel.find({ name: { $in: menuNames } });

      const menuMap = {};
      foundMenus.forEach(m => {
        menuMap[m.name] = m;
      });

      // Group selected counts by category
      const categoryCounts = {};

      // Process menu_sets
      enrichedMenuSets = menu_sets.map(item => {
        const menuDetails = menuMap[item.menu_name];
        let category = 'unknown';

        if (menuDetails) {
          category = menuDetails.category;
        }

        // Update count
        if (!categoryCounts[category]) categoryCounts[category] = 0;
        categoryCounts[category] += (item.quantity || 1);

        return {
          menuID: menuDetails ? menuDetails._id : null,
          menu_name: item.menu_name,
          category: category,
          quantity: item.quantity || 1
        };
      });

      // Calculate extra cost based on package categories
      if (menuPackage.categories && menuPackage.categories.length > 0) {
        menuPackage.categories.forEach(cat => {
          const quota = cat.quota || 0;
          const extraPrice = parseFloat((cat.extraPrice || 0).toString());

          const selectedCount = categoryCounts[cat.name] || 0;

          if (selectedCount > quota) {
            const extraItems = selectedCount - quota;
            const extraCost = extraItems * extraPrice * booking.table_count;
            totalPrice += extraCost;
          }
        });
      } else if (menuPackage.conditions && menuPackage.conditions.length > 0) {
        // Legacy support
        menuPackage.conditions.forEach(condition => {
          const cat = condition.category;
          const quota = condition.quota || 0;
          const extraPrice = parseFloat((condition.extraPrice || 0).toString());

          const selectedCount = categoryCounts[cat] || 0;

          if (selectedCount > quota) {
            const extraItems = selectedCount - quota;
            const extraCost = extraItems * extraPrice * booking.table_count;
            totalPrice += extraCost;
          }
        });
      }
    }

    // อัปเดตข้อมูลลง Booking
    booking.menu_sets = enrichedMenuSets.length > 0 ? enrichedMenuSets : (menu_sets || []);
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


