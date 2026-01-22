import React, { useEffect, useState } from 'react';
import { Users, Calendar, ShoppingBag, DollarSign, Search } from 'lucide-react';
import { Link } from 'react-router';
import adminService from '../../services/AdminService';
import bookingService from '../../services/BookingService';
import BookingDetailsModal from './../../components/admin/BookingDetailsModal';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    monthlyRevenue: []
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [dateAvailability, setDateAvailability] = useState({});
  const [maxBookingsPerDay] = useState(2); // Maximum 2 bookings per day
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const today = new Date();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminService.getDashboardSummary();
        const data = response.data.data;
        // console.log(data)
        setStatsData({
          totalUsers: data.stats.totalUsers,
          totalBookings: data.stats.totalBookings,
          totalRevenue: data.stats.totalRevenue,
          pendingBookings: data.stats.pendingBookings,
          depositPaidBookings: data.stats.depositPaidBookings,
          fullPaymentBookings: data.stats.fullPaymentBookings,
          cancelledBookings: data.stats.cancelledBookings,
          newUsersThisMonth: data.stats.newUsersThisMonth,
          newBookingsThisWeek: data.stats.newBookingsThisWeek,
          successRate: data.stats.successRate,
          monthlyRevenue: data.monthlyRevenue
        });

        // Format recent bookings from the API response
        setRecentBookings(data.recentBookings.map(booking => ({
          id: booking._id,
          bookingCode: booking.bookingCode,
          customer: `${booking.customer.name}`,
          package: booking.package.package_name,
          date: new Date(booking.event_datetime).toLocaleDateString('th-TH'),
          tableCount: booking.table_count,
          amount: typeof booking.total_price === 'object'
            ? parseFloat(booking.total_price.$numberDecimal)
            : booking.total_price,
          status: booking.payment_status
        })));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    const fetchDateAvailability = async () => {
      try {
        const response = await bookingService.getDateAvailability();
        setDateAvailability(response.data.data);
      } catch (error) {
        console.error('Error fetching date availability:', error);
      }
    };

    Promise.all([fetchDashboardData(), fetchDateAvailability()]);
  }, []);

  // Map status to appropriate display text and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending-deposit':
        return { text: 'รอยืนยัน', color: 'bg-yellow-100 text-yellow-800' };
      case 'deposit-paid':
        return { text: 'จ่ายมัดจำแล้ว', color: 'bg-blue-100 text-blue-800' };
      case 'full-payment':
        return { text: 'ชำระเต็มจำนวน', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'ยกเลิก', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Function to view booking details in modal
  const viewBookingDetails = async (booking) => {
    try {
      // If the booking object already has many properties, assume it's detailed from another source
      // Otherwise, fetch the full booking details from backend using the booking ID
      if (booking._id && Object.keys(booking).length > 8) { // If booking has many properties, assume it's detailed
        setSelectedBooking(booking);
        setShowModal(true);
      } else {
        // Fetch the full booking details from backend using either the id or _id field
        const bookingId = booking.id || booking._id;
        const response = await bookingService.getBookingById(bookingId);
        setSelectedBooking(response.data.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      // Fallback to display the limited booking info from the dashboard
      setSelectedBooking(booking);
      setShowModal(true);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Stats cards for catering business
  const statsCards = [
    {
      title: 'จำนวนลูกค้าทั้งหมด',
      value: statsData.totalUsers,
      change: '+12%',
      trend: 'up',
      color: 'blue',
      icon: <Users className="w-6 h-6 text-white" />
    },
    {
      title: 'การจองทั้งหมด',
      value: statsData.totalBookings,
      change: '+8%',
      trend: 'up',
      color: 'green',
      icon: <Calendar className="w-6 h-6 text-white" />
    },
    {
      title: 'รายได้รวม',
      value: `฿${typeof statsData.totalRevenue === 'object'
        ? parseFloat(statsData.totalRevenue.$numberDecimal || 0).toLocaleString()
        : parseFloat(statsData.totalRevenue || 0).toLocaleString()}`,
      change: '+15%',
      trend: 'up',
      color: 'yellow',
      icon: <DollarSign className="w-6 h-6 text-white" />
    },
    {
      title: 'การจองที่ยังไม่เสร็จ',
      value: statsData.pendingBookings,
      change: '-3%',
      trend: 'down',
      color: 'purple',
      icon: <ShoppingBag className="w-6 h-6 text-white" />
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-green-600"></span>
      </div>
    );
  }

  return (
    <div>
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-gray-600">ภาพรวมสถานะธุรกิจโต๊ะจีน ชัยเจริญโภชนา</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/admin/bookings" className="btn bg-green-600 text-white hover:bg-green-700">
            จัดการการจอง
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-green-200">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
              stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
              stat.color === 'green' ? 'from-green-500 to-green-600' :
              stat.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
              'from-purple-500 to-purple-600'
            } flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ?
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg> :
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                }
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar View Section */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">ปฏิทินการจองโต๊ะจีน</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                // Reset to current month
                const currentMonth = new Date();
                setViewMonth(currentMonth.getMonth());
                setViewYear(currentMonth.getFullYear());
              }}
              className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
              title="กลับไปเดือนปัจจุบัน"
            >
              ปัจจุบัน
            </button>
            <button
              onClick={() => {
                const prevMonth = new Date(viewYear, viewMonth - 1, 1);
                setViewMonth(prevMonth.getMonth());
                setViewYear(prevMonth.getFullYear());
              }}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-medium text-gray-700">
              {new Date(viewYear, viewMonth).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => {
                const nextMonth = new Date(viewYear, viewMonth + 1, 1);
                setViewMonth(nextMonth.getMonth());
                setViewYear(nextMonth.getFullYear());
              }}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
              <div key={index} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
              const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

              const days = [];

              // Add empty cells for days before the first day of the month
              for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(<div key={`empty-${i}`} className="p-2 text-center text-gray-300 text-sm"></div>);
              }

              // Add cells for each day of the month
              for (let day = 1; day <= daysInMonth; day++) {
                // Create date in Thailand timezone for consistency with backend
                const date = new Date(viewYear, viewMonth, day);
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const bookingCount = dateAvailability[dateStr] || 0;

                let bgColor = 'bg-gray-100'; // Default for past dates
                let textColor = 'text-gray-400';
                let isDisabled = true;
                let statusText = 'ยังไม่มีการจอง';

                // Check if this date is today or in the future
                // Create today's date in the same format for comparison
                const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const currentDate = new Date(viewYear, viewMonth, day);

                if (currentDate >= todayDate) {
                  if (bookingCount === 0) {
                    bgColor = 'bg-green-500'; // Available
                    textColor = 'text-white';
                    isDisabled = false;
                    statusText = 'ยังไม่มีการจอง';
                  } else if (bookingCount === 1) {
                    bgColor = 'bg-yellow-500'; // 1 booking
                    textColor = 'text-white';
                    isDisabled = false;
                    statusText = 'จองแล้ว';
                  } else if (bookingCount >= maxBookingsPerDay) {
                    bgColor = 'bg-red-500'; // Fully booked
                    textColor = 'text-white';
                    isDisabled = true;
                    statusText = 'จองเต็ม';
                  }
                } else {
                  // Past date
                  statusText = 'วันที่ผ่านมา';
                }

                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

                days.push(
                  <div
                    key={day}
                    className={`
                      p-2 text-center rounded-lg transition-colors
                      ${isDisabled ? 'opacity-50' : 'cursor-pointer hover:opacity-75'}
                      ${bgColor} ${textColor}
                      flex flex-col items-center justify-center
                      min-h-20
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                    `}
                    title={statusText}
                  >
                    <div className="text-lg font-bold">{day}</div>
                    <div className="text-xs mt-1">
                      {bookingCount > 0 ? `${bookingCount} งาน` : 'ว่าง'}
                    </div>
                    <div className="text-xs mt-1">
                      {statusText}
                    </div>
                  </div>
                );
              }

              return days;
            })()}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap justify-center gap-6 mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded mr-2 flex items-center justify-center">
                <span className="text-xs text-white">0</span>
              </div>
              <span>ยังไม่มีการจอง</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-500 rounded mr-2 flex items-center justify-center">
                <span className="text-xs text-white">1</span>
              </div>
              <span>จองแล้ว 1 งาน</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-500 rounded mr-2 flex items-center justify-center">
                <span className="text-xs text-white">2</span>
              </div>
              <span>จองเต็ม (2 งาน)</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded mr-2 flex items-center justify-center">
                <span className="text-xs text-white">X</span>
              </div>
              <span>วันที่ผ่านมา</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200">
        <div className="px-6 py-4 border-b border-green-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">การจองล่าสุด</h3>
            <Link to="/admin/bookings" className="btn btn-sm bg-green-600 text-white hover:bg-green-700">
              ดูทั้งหมด
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green-200 bg-green-50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ID การจอง</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ชุดโต๊ะจีน</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่จัด</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนโต๊ะ</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-green-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.bookingCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.package}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.tableCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">฿{booking.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(booking.status).color}`}>
                      {getStatusInfo(booking.status).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewBookingDetails(booking)}
                        className="p-1 hover:bg-green-100 rounded text-blue-600"
                        type="button"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      {/* <Link to={`/admin/bookings/${booking.id}/edit`} className="p-1 hover:bg-green-100 rounded text-yellow-600">
                        <Edit className="w-4 h-4" />
                      </Link> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ลูกค้าใหม่ (เดือนนี้)</h3>
          <div className="text-3xl font-bold text-green-600">{statsData.newUsersThisMonth}</div>
          <div className="text-sm text-gray-600 mt-1">- จากเดือนที่แล้ว</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">การจองใหม่ (สัปดาห์นี้)</h3>
          <div className="text-3xl font-bold text-blue-600">{statsData.newBookingsThisWeek}</div>
          <div className="text-sm text-gray-600 mt-1">- จากสัปดาห์ที่แล้ว</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">อัตราการสำเร็จ</h3>
          <div className="text-3xl font-bold text-purple-600">{statsData.successRate}%</div>
          <div className="text-sm text-gray-600 mt-1">- จากเดือนที่แล้ว</div>
        </div>
      </div>
    </div>

    {/* Booking Details Modal */}
    {showModal && (
      <BookingDetailsModal
        isOpen={showModal}
        onClose={closeModal}
        booking={selectedBooking}
      />
    )}
  </div>
);
};

export default Dashboard;