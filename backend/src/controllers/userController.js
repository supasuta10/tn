const { hashPassword } = require('../helpers/hashPassword');
const userModel = require('../models/userModel');

const getUserInfo = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

        res.status(200).json({ data: user });

    } catch (error) {
        console.error("getUserInfo Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.status(200).json({ data: users });

    } catch (error) {
        console.error("getAllUsers Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const searchUserByRole = async (req, res) => {
    try {
        const { role } = req.query;

        if (!role) {
            return res.status(400).json({ message: "ต้องระบุบทบาท" });
        }

        const users = await userModel.find({ role }).select("-password");

        res.status(200).json({ data: users });

    } catch (error) {
        console.error("searchUserByRole Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id).select("-password");
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

        res.status(200).json({ data: user });

    } catch (error) {
        console.error("getUserById Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { title, firstName, lastName, username, email, password, phone } = req.body;
        const userId = req.user._id;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

        if (req.body.role && req.body.role !== user.role) {
            return res.status(403).json({ message: "คุณไม่มีสิทธิ์แก้ไข Role" });
        }

        const exists = await userModel.findOne({
            $or: [
                username ? { username } : null,
                email ? { email } : null,
                phone ? { phone } : null
            ].filter(Boolean),
            _id: { $ne: userId }
        });

        if (exists) {
            return res.status(400).json({
                msg:
                    exists.username === username
                        ? "Username นี้ถูกใช้งานแล้ว"
                    : exists.email === email
                        ? "อีเมลนี้ถูกใช้งานแล้ว"
                    : "เบอร์โทรนี้ถูกใช้งานแล้ว"
            });
        }

        const hashedPassword = password ? await hashPassword(password) : user.password;

        const updateData = {
            title: title ?? user.title,
            firstName: firstName ?? user.firstName,
            lastName: lastName ?? user.lastName,
            username: username ?? user.username,
            email: email ?? user.email,
            password: hashedPassword,
            phone: phone ?? user.phone
        };

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, select: "-password" }
        );

        res.status(200).json({
            msg: "อัปเดตข้อมูลผู้ใช้สำเร็จ",
            data: updatedUser
        });

    } catch (error) {
        console.error("updateProfile Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createUser = async (req, res) => {
    try {
        const { title, firstName, lastName, username, email, password, phone, role } = req.body;

        // Check if required fields are provided
        if (!title || !firstName || !lastName || !username || !email || !password || !phone) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
        }

        // Validate role (only allow admin to create users with specific roles)
        const allowedRoles = ['admin', 'customer', 'chef'];
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({ message: "บทบาทไม่ถูกต้อง" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [
                { username },
                { email },
                { phone }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: existingUser.username === username
                    ? "Username นี้ถูกใช้งานแล้ว"
                    : existingUser.email === email
                        ? "อีเมลนี้ถูกใช้งานแล้ว"
                        : "เบอร์โทรนี้ถูกใช้งานแล้ว"
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create the new user
        const newUser = new userModel({
            title,
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            phone,
            role: role || 'customer' // Default to customer if no role specified
        });

        const savedUser = await newUser.save();

        // Return user info without password
        const userResponse = { ...savedUser.toObject() };
        delete userResponse.password;

        res.status(201).json({
            message: "สร้างผู้ใช้สำเร็จ",
            data: userResponse
        });

    } catch (error) {
        console.error("createUser Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = { ...req.body };

        delete updates._id;

        if (updates.role && updates.role === "admin") {
            return res.status(403).json({ message: "ไม่สามารถตั้ง Role เป็น Admin ผ่าน API นี้ได้" });
        }

        if (updates.username || updates.email || updates.phone) {
            const exists = await userModel.findOne({
                $or: [
                    updates.username ? { username: updates.username } : null,
                    updates.email ? { email: updates.email } : null,
                    updates.phone ? { phone: updates.phone } : null
                ].filter(Boolean),
                _id: { $ne: userId }
            });

            if (exists) {
                return res.status(400).json({
                    message:
                        exists.username === updates.username
                            ? "Username นี้ถูกใช้งานแล้ว"
                        : exists.email === updates.email
                            ? "อีเมลนี้ถูกใช้งานแล้ว"
                        : "เบอร์โทรนี้ถูกใช้งานแล้ว"
                });
            }
        }

        if (updates.password) {
            updates.password = await hashPassword(updates.password);
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            updates,
            { new: true, select: "-password" }
        );

        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

        res.status(200).json({
            message: "อัปเดตผู้ใช้สำเร็จ",
            data: user
        });

    } catch (error) {
        console.error("updateUser Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};


const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);

        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

        // Toggle the isActive status
        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            message: user.isActive ? "เปิดใช้งานผู้ใช้สำเร็จ" : "ปิดใช้งานผู้ใช้สำเร็จ",
            data: user
        });

    } catch (error) {
        console.error("toggleUserStatus Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

        res.status(200).json({ message: "ลบผู้ใช้สำเร็จ", data: user });

    } catch (error) {
        console.error("deleteUser Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

// Get users with booking counts and VIP status
const getUsersWithBookingCounts = async (req, res) => {
    try {
        // Get all users
        const users = await userModel.find().select("-password");

        // Get all bookings to count per customer
        const BookingModel = require('../models/bookingModel');
        const bookings = await BookingModel.find();

        // Count bookings per customer
        const bookingCounts = {};
        bookings.forEach(booking => {
            let customerId = null;

            // Try different ways to get customer ID
            if (booking.customer && typeof booking.customer === 'object') {
                customerId = booking.customer.customerID || booking.customer._id;
            } else if (booking.customer_id) {
                customerId = booking.customer_id;
            } else if (typeof booking.customer === 'string') {
                customerId = booking.customer;
            }

            if (customerId) {
                const customerIdStr = customerId.toString();
                bookingCounts[customerIdStr] = (bookingCounts[customerIdStr] || 0) + 1;
            }
        });

        // Add booking counts and VIP status to users
        const usersWithBookingCounts = users.map(user => {
            const bookingCount = bookingCounts[user._id.toString()] || 0;
            const isVIP = bookingCount >= 3; // Consider as VIP if 3 or more bookings

            return {
                ...user.toObject(),
                bookingCount,
                isVIP
            };
        });

        res.status(200).json({ data: usersWithBookingCounts });

    } catch (error) {
        console.error("getUsersWithBookingCounts Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

module.exports = {
    getUserInfo,
    getAllUsers,
    searchUserByRole,
    getUserById,
    updateProfile,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getUsersWithBookingCounts,
};
