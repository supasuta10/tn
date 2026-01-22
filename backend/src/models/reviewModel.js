const mongoose = require('mongoose');

const MIN_RATING = 1;
const MAX_RATING = 5;

const reviewSchema = new mongoose.Schema(
    {
        customerID: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true 
        },
        bookingID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking", 
            required: true,
            unique: true,
            index: true 
        },

        rating: {
            type: Number, 
            required: true,
            min: MIN_RATING,
            max: MAX_RATING
        },
        review_text: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000 
        },
        review_date: {
            type: Date,
            required: true,
            default: Date.now 
        }
    },
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model("Review", reviewSchema);