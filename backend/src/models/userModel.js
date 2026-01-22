const mongoose = require('mongoose');

const ROLE_STATUS = ['admin', 'customer','chef'];
const TITLES = ['นาย.', 'นาง.', 'น.ส.', 'Mr.', 'Ms.'];

const userSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            enum: TITLES,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "รูปแบบอีเมลไม่ถูกต้อง"]
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            match: [/^[0-9]{10}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก"]
        },
        role: {
            type: String,
            enum: ROLE_STATUS,
            default: "customer",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

userSchema.index({ username: 1, email: 1, phone: 1 });

module.exports = mongoose.model('User', userSchema);
