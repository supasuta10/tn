const mongoose = require('mongoose');
require('dotenv').config();

// Import the booking model
const BookingModel = require('../src/models/bookingModel');

// Function to generate booking codes
function generateBookingCode() {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `BK-${year}${month}${day}${randomNum}`;
}

const fixBookingCodes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/ChaiCharoen-Catering');
    console.log('Connected to MongoDB');

    // Find all bookings that have null or undefined bookingCode
    const bookingsWithNullCode = await BookingModel.find({
      $or: [
        { bookingCode: null },
        { bookingCode: { $exists: false } },
        { bookingCode: '' }
      ]
    });

    console.log(`Found ${bookingsWithNullCode.length} bookings with null/empty bookingCode`);

    // Update each booking with a unique booking code
    for (const booking of bookingsWithNullCode) {
      const newBookingCode = generateBookingCode();
      
      // Ensure uniqueness by checking if code already exists
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) { // Safety check to avoid infinite loop
        const existingBooking = await BookingModel.findOne({ bookingCode: newBookingCode });
        if (!existingBooking) {
          isUnique = true;
        } else {
          // Generate a new code if this one already exists
          newBookingCode = generateBookingCode();
          attempts++;
        }
      }

      if (isUnique) {
        await BookingModel.findByIdAndUpdate(
          booking._id,
          { $set: { bookingCode: newBookingCode } },
          { new: true, runValidators: true }
        );
        console.log(`Updated booking ${booking._id} with code: ${newBookingCode}`);
      } else {
        console.log(`Could not generate unique code for booking ${booking._id} after 10 attempts`);
      }
    }

    console.log('Booking code fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing booking codes:', error);
    process.exit(1);
  }
};

// Run the script
fixBookingCodes();