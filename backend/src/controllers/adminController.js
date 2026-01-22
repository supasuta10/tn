const BookingModel = require("../models/bookingModel");
const UserModel = require("../models/userModel");
const ReviewModel = require("../models/reviewModel");
const MenuPackageModel = require("../models/menuPackageModel");
const MenuModel = require("../models/menuModel");

// Get admin dashboard summary
exports.getAdminDashboardSummary = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await UserModel.countDocuments();

        // Get total bookings count
        const totalBookings = await BookingModel.countDocuments();

        // Get total revenue (sum of all booking totals)
        const totalRevenueResult = await BookingModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total_price" }
                }
            }
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

        // Get bookings with different statuses
        const pendingBookings = await BookingModel.countDocuments({ payment_status: 'pending-deposit' });
        const depositPaidBookings = await BookingModel.countDocuments({ payment_status: 'deposit-paid' });
        const fullPaymentBookings = await BookingModel.countDocuments({ payment_status: 'full-payment' });
        const cancelledBookings = await BookingModel.countDocuments({ payment_status: 'cancelled' });

        // Get recent bookings (last 5)
        const recentBookings = await BookingModel.find()
            .select('bookingCode customer event_datetime table_count total_price payment_status createdAt')
            .populate("customer.customerID", "name email phone")
            .populate("package.packageID")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent users (last 5)
        const recentUsers = await UserModel.find()
            .select("title firstName lastName email phone role createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get monthly revenue for current year
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = await BookingModel.aggregate([
            {
                $match: {
                    event_datetime: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$event_datetime" },
                    totalRevenue: { $sum: "$total_price" },
                    bookingCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Calculate new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await UserModel.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Calculate new bookings this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const newBookingsThisWeek = await BookingModel.countDocuments({
            createdAt: { $gte: startOfWeek }
        });

        // Calculate success rate
        const completedBookings = depositPaidBookings + fullPaymentBookings;
        const totalActiveBookings = pendingBookings + depositPaidBookings + fullPaymentBookings;
        const successRate = totalActiveBookings > 0 ? Math.round((completedBookings / totalActiveBookings) * 100) : 0;

        // Convert monthly data to proper format for frontend
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const monthlyRevenueData = months.map((month, index) => {
            const monthData = monthlyRevenue.find(m => m._id === index + 1);
            return {
                month,
                revenue: monthData ? monthData.totalRevenue : 0,
                bookingCount: monthData ? monthData.bookingCount : 0
            };
        });

        res.status(200).json({
            data: {
                stats: {
                    totalUsers,
                    totalBookings,
                    totalRevenue,
                    pendingBookings,
                    depositPaidBookings,
                    fullPaymentBookings,
                    cancelledBookings,
                    newUsersThisMonth,
                    newBookingsThisWeek,
                    successRate
                },
                recentBookings,
                recentUsers,
                monthlyRevenue: monthlyRevenueData
            }
        });

    } catch (error) {
        console.error("getAdminDashboardSummary Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
    try {
        // Get user growth over time
        const userGrowth = await UserModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Get booking trends
        const bookingTrends = await BookingModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: "$total_price" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Get popular menu packages
        const popularPackages = await BookingModel.aggregate([
            {
                $group: {
                    _id: "$package.packageID",
                    count: { $sum: 1 },
                    totalRevenue: { $sum: "$total_price" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            data: {
                userGrowth,
                bookingTrends,
                popularPackages
            }
        });

    } catch (error) {
        console.error("getAnalytics Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get reports
exports.getReports = async (req, res) => {
    try {
        // Get basic report data
        const reportData = await BookingModel.aggregate([
            {
                $group: {
                    _id: {
                        status: "$payment_status",
                        year: { $year: "$event_datetime" },
                        month: { $month: "$event_datetime" }
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: "$total_price" }
                }
            }
        ]);

        res.status(200).json({
            data: reportData
        });

    } catch (error) {
        console.error("getReports Error:", error);
        res.status(500).json({ message: error.message });
    }
};