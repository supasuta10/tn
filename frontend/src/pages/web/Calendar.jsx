import React, { useState, useEffect } from 'react';
import BookingService from '../../services/BookingService';

const Calendar = () => {
  const [dateAvailability, setDateAvailability] = useState({});
  const [maxBookingsPerDay] = useState(2); // Maximum 2 bookings per day
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    const fetchDateAvailability = async () => {
      try {
        const response = await BookingService.getDateAvailability();
        setDateAvailability(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching date availability:', error);
        setError('ไม่สามารถโหลดข้อมูลปฏิทินการจองได้ กรุณาลองอีกครั้ง');
        setLoading(false);
      }
    };
    fetchDateAvailability();
  }, []);

  // CalendarView Component
  const CalendarView = ({ dateAvailability, maxBookingsPerDay, viewYear, viewMonth, setViewYear, setViewMonth }) => {
    const today = new Date();

    // Get days in month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    
    // Create day cells
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-center"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Format: YYYY-MM-DD
      const bookingCount = dateAvailability[dateStr] || 0;

      let bgColor = 'bg-gray-100'; // Default for past dates
      let textColor = 'text-gray-400';
      let isDisabled = true;

      // Check if this date is today or in the future
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (date >= todayDate) {
        if (bookingCount === 0) {
          bgColor = 'bg-green-500'; // Available
          textColor = 'text-white';
          isDisabled = false;
        } else if (bookingCount === 1) {
          bgColor = 'bg-yellow-500'; // 1 booking
          textColor = 'text-white';
          isDisabled = false;
        } else if (bookingCount >= maxBookingsPerDay) {
          bgColor = 'bg-red-500'; // Fully booked
          textColor = 'text-white';
          isDisabled = true;
        }
      }

      days.push(
        <div
          key={day}
          className={`
            p-3 text-center rounded-lg transition-colors
            ${isDisabled ? 'opacity-50' : 'cursor-pointer hover:opacity-75'}
            ${bgColor} ${textColor}
            flex flex-col items-center justify-center
            min-h-20
          `}
        >
          <div className="text-lg font-bold">{day}</div>
          <div className="text-xs mt-1">
            {bookingCount > 0 ? `${bookingCount} งาน` : 'ว่าง'}
          </div>
        </div>
      );
    }

    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              // Reset to current month
              const currentMonth = new Date();
              setViewYear(currentMonth.getFullYear());
              setViewMonth(currentMonth.getMonth());
            }}
            className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
            title="กลับไปเดือนปัจจุบัน"
          >
            ปัจจุบัน
          </button>
          <button
            onClick={() => {
              const prevMonth = new Date(viewYear, viewMonth - 1, 1);
              setViewYear(prevMonth.getFullYear());
              setViewMonth(prevMonth.getMonth());
            }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-2xl font-bold text-green-700">
            {new Date(viewYear, viewMonth).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => {
              const nextMonth = new Date(viewYear, viewMonth + 1, 1);
              setViewYear(nextMonth.getFullYear());
              setViewMonth(nextMonth.getMonth());
            }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((dayName, index) => (
            <div key={index} className="text-center font-medium text-gray-700 p-2">
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-2">ปฏิทินการจองโต๊ะจีน</h1>
        <p className="text-gray-600 text-center mb-8">แสดงวันที่สามารถจองโต๊ะจีนได้ (จองได้สูงสุด 2 งานต่อวัน)</p>

        {/* Calendar Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
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

        {/* Calendar Component */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-green-200">
          <CalendarView
            dateAvailability={dateAvailability}
            maxBookingsPerDay={maxBookingsPerDay}
            viewYear={viewYear}
            viewMonth={viewMonth}
            setViewYear={setViewYear}
            setViewMonth={setViewMonth}
          />
        </div>

        {/* Booking Call to Action */}
        <div className="mt-10 bg-green-50 p-6 rounded-xl border border-green-200 text-center">
          <h2 className="text-xl font-bold text-green-700 mb-4">พร้อมจัดงานเลี้ยงโต๊ะจีนของคุณ?</h2>
          <p className="text-gray-600 mb-6">
            หากคุณต้องการจัดงานเลี้ยงโต๊ะจีน กรุณาเลือกวันที่ต้องการและติดต่อเราเพื่อจองล่วงหน้า
          </p>
          <a 
            href="/booking" 
            className="btn bg-green-600 text-white hover:bg-green-700 px-6 py-3 text-lg"
          >
            จองโต๊ะจีนตอนนี้
          </a>
        </div>
      </div>
    </div>
  );
};

export default Calendar;