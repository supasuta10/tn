const mongoose = require('mongoose');
const bookingModel = require('../models/bookingModel');
const userModel = require('../models/userModel');
const ReviewModel = require('../models/reviewModel');
const { sendLineMessage } = require('../middleware/lineMessage');
const { LINE_USER_ID } = require('../utils/constants');

// Get customer dashboard summary
const getCustomerDashboardSummary = async (req, res) => {
    try {
        const customerId = req.user._id;
        
        // Get customer profile info
        const customer = await userModel.findById(customerId).select("-password");
        if (!customer) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        }

        // Get customer's booking count
        const bookingCount = await bookingModel.countDocuments({ 'customer.customerID': customerId });
        
        // Get customer's recent bookings (up to 5)
        const recentBookings = await bookingModel.find({ 'customer.customerID': customerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('bookingCode package.package_name event_datetime table_count payment_status total_price');

        // Calculate total spending
        const totalSpending = await bookingModel.aggregate([
            { $match: { 'customer.customerID': customerId } },
            { $group: { _id: null, total: { $sum: '$total_price' } } }
        ]);

        const totalSpent = totalSpending.length > 0 ? totalSpending[0].total : 0;

        // Get upcoming booking (if any)
        const upcomingBooking = await bookingModel.findOne({
            'customer.customerID': customerId,
            event_datetime: { $gte: new Date() }
        }).sort({ event_datetime: 1 });

        // Get total review count
        const reviewCount = await ReviewModel.countDocuments({ customerID: customerId });

        res.status(200).json({
            data: {
                customer: {
                    name: `${customer.title} ${customer.firstName} ${customer.lastName}`,
                    email: customer.email,
                    phone: customer.phone
                },
                stats: {
                    totalBookings: bookingCount,
                    totalSpent: totalSpent,
                    totalReviews: reviewCount,
                    upcomingBooking: upcomingBooking ? {
                        date: upcomingBooking.event_datetime,
                        packageName: upcomingBooking.package.package_name,
                        tableCount: upcomingBooking.table_count
                    } : null
                },
                recentBookings: recentBookings
            }
        });

    } catch (error) {
        console.error("getCustomerDashboardSummary Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

// Get customer's bookings
const getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { status } = req.query;

        let query = { 'customer.customerID': customerId };
        
        if (status) {
            query.payment_status = status;
        }

        const bookings = await bookingModel.find(query)
            .sort({ createdAt: -1 })
            // .select('package.package_name event_datetime table_count payment_status total_price createdAt');

        res.status(200).json({ data: bookings });

    } catch (error) {
        console.error("getCustomerBookings Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

// Get customer profile
const getCustomerProfile = async (req, res) => {
    try {
        const customerId = req.user._id;
        
        const customer = await userModel.findById(customerId).select("-password");
        if (!customer) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        }

        res.status(200).json({ data: customer });

    } catch (error) {
        console.error("getCustomerProfile Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

// Update customer profile
const updateCustomerProfile = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { title, firstName, lastName, username, email, phone, address } = req.body;

        // Check if new email/username/phone already exists for another user
        const existingUser = await userModel.findOne({
            $or: [
                username ? { username } : null,
                email ? { email } : null,
                phone ? { phone } : null
            ].filter(Boolean),
            _id: { $ne: customerId }
        });

        if (existingUser) {
            return res.status(400).json({
                message:
                    existingUser.username === username
                        ? "Username นี้ถูกใช้งานแล้ว"
                        : existingUser.email === email
                            ? "อีเมลนี้ถูกใช้งานแล้ว"
                        : "เบอร์โทรนี้ถูกใช้งานแล้ว"
            });
        }

        const updatedCustomer = await userModel.findByIdAndUpdate(
            customerId,
            { title, firstName, lastName, username, email, phone, address },
            { new: true, select: "-password" }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        }

        res.status(200).json({
            message: "อัปเดตโปรไฟล์สำเร็จ",
            data: updatedCustomer
        });

    } catch (error) {
        console.error("updateCustomerProfile Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

// Cancel customer's booking
const cancelCustomerBooking = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { id } = req.params;

        // Find the booking that belongs to the customer
        const booking = await bookingModel.findOne({
            _id: id,
            'customer.customerID': customerId
        });

        if (!booking) {
            return res.status(404).json({ message: "ไม่พบการจองหรือการจองไม่ได้อยู่ในชื่อของคุณ" });
        }

        // Check if the booking can be cancelled (only allow cancellation if status is pending-deposit)
        if (booking.payment_status !== 'pending-deposit') {
            return res.status(400).json({
                message: `ไม่สามารถยกเลิกการจองที่มีสถานะ: ${booking.payment_status} ได้ สามารถยกเลิกได้เฉพาะการจองที่ยังไม่ได้ชำระเงิน`
            });
        }

        // Update booking status to cancelled
        booking.payment_status = 'cancelled';
        await booking.save();

        // Send LINE notification about cancellation
        const cancelMessage =
          `❌ ยกเลิกการจองแล้ว\n\n` +
          `🔖 Booking Code: ${booking.bookingCode}\n` +
          `👤 ลูกค้า: ${booking.customer.name}\n` +
          `📞 เบอร์: ${booking.customer.phone}\n` +
          `📅 วันงาน: ${new Date(booking.event_datetime).toLocaleString("th-TH")}`;

        await sendLineMessage(LINE_USER_ID, cancelMessage);

        res.status(200).json({
            message: "ยกเลิกการจองสำเร็จ",
            data: booking
        });

    } catch (error) {
        console.error("cancelCustomerBooking Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

// Submit payment slip for customer's booking
const submitPaymentForBooking = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { id } = req.params;
        const { amount, payment_type } = req.body;

        // Find the booking that belongs to the customer
        const booking = await bookingModel.findOne({
            _id: id,
            'customer.customerID': customerId
        });

        if (!booking) {
            return res.status(404).json({ message: "ไม่พบการจองหรือการจองไม่ได้อยู่ในชื่อของคุณ" });
        }

        // Check if booking is in a state where payment can be made
        if (booking.payment_status === 'cancelled') {
            return res.status(400).json({ message: "ไม่สามารถแจ้งชำระเงินสำหรับการจองที่ถูกยกเลิกได้" });
        }

        // Validate required fields
        if (!amount || !payment_type) {
            return res.status(400).json({ message: "จำเป็นต้องระบุจำนวนเงินและประเภทการชำระเงิน" });
        }

        // Handle uploaded file (payment slip)
        let slip_image = null;
        if (req.file) {
            // Store the file path - in a production app, you might want to store the file in cloud storage
            // For this implementation, we'll use a relative path
            slip_image = `/uploads/${req.file.filename}`;
        }

        // Add payment to the payments array
        booking.payments.push({
            payment_date: new Date(),
            amount: new mongoose.Types.Decimal128(amount.toString()),
            payment_type: payment_type,
            slip_image: slip_image // This will be the path to the uploaded slip image
        });

        // If this is a deposit payment and it's the first payment, update status to 'deposit-paid'
        if (payment_type === 'deposit' && booking.payment_status === 'pending-deposit') {
            booking.payment_status = 'deposit-paid';
        }
        // If this is a full payment, update status to 'full-payment'
        else if (payment_type === 'full-payment') {
            booking.payment_status = 'full-payment';
        }
        // For balance payments, if total payments cover the full amount, update to 'full-payment'
        else if (payment_type === 'balance') {
            // Calculate total payments made
            let totalPayments = 0;
            booking.payments.forEach(payment => {
                totalPayments += parseFloat(payment.amount.toString());
            });

            const totalRequired = parseFloat(booking.total_price.toString());
            if (totalPayments >= totalRequired) {
                booking.payment_status = 'full-payment';
            }
        }

        await booking.save();

        res.status(200).json({
            message: "แจ้งชำระเงินสำเร็จ",
            data: booking
        });

    } catch (error) {
        console.error("submitPaymentForBooking Error:", error);

        // If there's an error and a file was uploaded, delete it
        if (req.file) {
            const fs = require('fs');
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

module.exports = {
    getCustomerDashboardSummary,
    getCustomerBookings,
    getCustomerProfile,
    updateCustomerProfile,
    cancelCustomerBooking,
    submitPaymentForBooking
};

// Update customer's booking menu sets
const updateBookingMenuSets = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { id } = req.params;
        const { menu_sets } = req.body;

        // Find the booking that belongs to the customer
        const booking = await bookingModel.findOne({
            _id: id,
            'customer.customerID': customerId
        });

        if (!booking) {
            return res.status(404).json({ message: "ไม่พบการจองหรือการจองไม่ได้อยู่ในชื่อของคุณ" });
        }

        // Check if booking can be modified (only allow modifications if status is pending-deposit or deposit-paid)
        if (booking.payment_status === 'full-payment' || booking.payment_status === 'cancelled') {
            return res.status(400).json({
                message: `ไม่สามารถแก้ไขรายละเอียดเมนูที่มีสถานะ: ${booking.payment_status} ได้ สามารถแก้ไขได้เฉพาะการจองที่ยังไม่ชำระเต็มจำนวน`
            });
        }

        // Get menu package to check limits
        const MenuPackageModel = require('../models/menuPackageModel');
        const menuPackage = await MenuPackageModel.findById(booking.package.packageID);
        if (!menuPackage) {
            return res.status(404).json({ message: "ไม่พบข้อมูลแพ็กเกจเมนู" });
        }

        // Validate menu sets array
        if (!Array.isArray(menu_sets)) {
            return res.status(400).json({ message: "รูปแบบข้อมูลเมนูไม่ถูกต้อง" });
        }

        // Check menu limits
        const totalSelected = menu_sets.length;
        const maxSelect = menuPackage.maxSelect || 8;
        const extraMenuPrice = parseFloat(menuPackage.extraMenuPrice || 200);

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

        // Update menu sets
        booking.menu_sets = menu_sets;

        // Calculate additional cost if any
        let totalPrice = parseFloat(booking.package.price_per_table.toString()) * booking.table_count;

        if (totalSelected > maxSelect) {
            const extraMenus = totalSelected - maxSelect;
            const extraCost = extraMenus * extraMenuPrice * booking.table_count;
            totalPrice += extraCost;
        }

        // Recalculate total price
        booking.total_price = new mongoose.Types.Decimal128(totalPrice.toString());

        await booking.save();

        res.status(200).json({
            message: "อัปเดตรายการอาหารสำเร็จ",
            data: booking
        });

    } catch (error) {
        console.error("updateBookingMenuSets Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

module.exports = {
    getCustomerDashboardSummary,
    getCustomerBookings,
    getCustomerProfile,
    updateCustomerProfile,
    cancelCustomerBooking,
    submitPaymentForBooking,
    updateBookingMenuSets
};