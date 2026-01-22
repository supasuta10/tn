const { hashPassword, comparePassword } = require('../helpers/hashPassword');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { title, firstName, lastName, username, email, password, phone, role } = req.body;

        // Validate required fields
        if (!username || !password || !phone || !firstName || !lastName) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        // Validate phone format
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ message: "กรุณากรอกเบอร์โทรให้ครบ 10 ตัวเลข" });
        }

        // Check unique fields
        const existingUser = await userModel.findOne({
            $or: [{ username }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: existingUser.username === username
                    ? "Username นี้ถูกใช้งานแล้ว"
                    : "เบอร์โทรนี้ถูกใช้งานแล้ว"
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await userModel.create({
            title,
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            phone,
            role: role || "customer"
        });

        res.status(201).json({
            message: "สมัครสมาชิกสำเร็จ",
            data: {
                id: newUser._id,
                username: newUser.username,
                phone: newUser.phone,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const login = async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
        }

        // Find by username OR email
        const user = await userModel.findOne({
            $or: [
                { username: login },
                { email: login }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้" });
        }

        // Compare password
        const passwordMatch = await comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
        }

        // Generate token
        const token = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.status(200).json({
            success: true,
            message: "เข้าสู่ระบบสำเร็จ",
            data: {
                full_name: `${user.title || ""} ${user.firstName} ${user.lastName}`.trim(),
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
};

const autoCreateAdmin = async () => {
    try {
        const adminExists = await userModel.findOne({ role: "admin" });

        if (!adminExists) {
            const hashedPassword = await hashPassword("1234");

            await userModel.create({
                title: "Mr.",
                firstName: "System",
                lastName: "Admin",
                email:"admin@admin.com",
                username: "admin",
                password: hashedPassword,
                phone: "0000000000",
                role: "admin"
            });

            console.log("Admin created.");
        } else {
            console.log("Admin already exists.");
        }
    } catch (error) {
        console.error("Create Admin Error:", error);
    }
};

module.exports = {
    register,
    login,
    autoCreateAdmin
};
