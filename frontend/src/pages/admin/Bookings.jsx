import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Edit, Trash2, Search, CheckCircle, Clock, XCircle, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import bookingService from './../../services/BookingService';
import menuService from './../../services/MenuService';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';
import MapDisplay from './../../components/shared/MapDisplay';
import { formatNumber, formatPriceWithCurrency } from '../../utils/priceUtils';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); // Filter by status
  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // Filter by date range
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewedBookings, setViewedBookings] = useState(new Set());
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [currentBookingForMenuEdit, setCurrentBookingForMenuEdit] = useState(null);
  const [availableMenus, setAvailableMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  // Load bookings from API when component mounts
  useEffect(() => {
    loadBookings();
  }, []);

  // Load viewed bookings from localStorage on mount
  useEffect(() => {
    const storedViewedBookings = localStorage.getItem('viewedBookings');
    if (storedViewedBookings) {
      setViewedBookings(new Set(JSON.parse(storedViewedBookings)));
    }
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings();
      // console.log('Booking API Response:', response.data.data);
      setBookings(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลการจองได้');
      console.error('Error loading bookings:', err);
      Swal.fire({
        icon: 'error',
        title: 'การโหลดข้อมูลล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะโหลดข้อมูลการจอง',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to update booking status
  const updateBookingStatus = async (bookingId, newStatus, amount = null, slipFile = null, paymentType = null) => {
    try {
      // Map backend status to Thai display
      const statusThai =
        newStatus === 'deposit-paid' ? 'ยืนยันแล้ว' :
          newStatus === 'full-payment' ? 'เสร็จสิ้น' :
            newStatus === 'cancelled' ? 'ยกเลิก' :
              'รอดำเนินการ';

      // If this is a payment status update and requires a slip upload
      if ((newStatus === 'deposit-paid' || newStatus === 'full-payment') && slipFile) {
        // Check if payment amount matches required deposit for deposit payments
        if (newStatus === 'deposit-paid' && amount !== null) {
          // Get the booking data to check required deposit amount
          const bookingResponse = await bookingService.getBookingById(bookingId);
          const booking = bookingResponse.data.data;

          const requiredAmount = typeof booking.deposit_required === 'object'
            ? parseFloat(booking.deposit_required.$numberDecimal)
            : parseFloat(booking.deposit_required || 0);
          const paymentAmount = parseFloat(amount || 0);

          // Show warning if payment amount is less than required deposit
          if (paymentAmount < requiredAmount) {
            const confirmResult = await Swal.fire({
              title: 'ตรวจสอบยอดชำระ',
              text: `ยอดชำระเงิน (฿${paymentAmount}) น้อยกว่าจำนวนเงินมัดจำที่ต้องชำระ (฿${requiredAmount}) คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'ดำเนินการต่อ',
              cancelButtonText: 'ยกเลิก'
            });

            if (!confirmResult.isConfirmed) {
              return; // Cancel the payment update
            }
          }
        }

        const result = await Swal.fire({
          title: 'อัปโหลดหลักฐานการชำระเงิน',
          text: `คุณต้องการอัปโหลดหลักฐานการชำระเงินและเปลี่ยนสถานะเป็น ${statusThai} ใช่หรือไม่?`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'อัปโหลดและปรับปรุง',
          cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
          try {
            // First upload the payment slip
            const slipUploadResponse = await bookingService.uploadPaymentSlip(slipFile);
            const slipPath = slipUploadResponse.data.filePath;

            // Map frontend status values to backend status values
            let backendStatus;
            switch (newStatus) {
              case 'Confirmed':
                backendStatus = 'deposit-paid';
                break;
              case 'Completed':
                backendStatus = 'full-payment';
                break;
              case 'Cancelled':
                backendStatus = 'cancelled';
                break;
              case 'Pending':
                backendStatus = 'pending-deposit';
                break;
              default:
                backendStatus = newStatus;
            }

            // Update booking status with slip information
            const statusData = {
              status: backendStatus,
              amount: amount,
              slip_image: slipPath,
              payment_type: paymentType || 'deposit'
            };

            await bookingService.updateBookingStatus(bookingId, statusData);

            // Refresh bookings list
            await loadBookings();

            Swal.fire({
              icon: 'success',
              title: 'สถานะถูกอัปเดตแล้ว!',
              text: `สถานะการจองได้ถูกอัปเดตเป็น ${statusThai} เรียบร้อยแล้ว`,
              confirmButtonColor: '#22c55e'
            });
          } catch (uploadError) {
            console.error('Error uploading payment slip or updating booking:', uploadError);
            Swal.fire({
              icon: 'error',
              title: 'การอัปเดตล้มเหลว',
              text: uploadError.response?.data?.message || 'เกิดข้อผิดพลาดขณะอัปโหลดหลักฐานการชำระเงิน',
              confirmButtonColor: '#dc2626'
            });
          }
        }
      } else {
        // For status changes without slip uploads (like cancellations)
        const result = await Swal.fire({
          title: 'คุณแน่ใจหรือไม่?',
          text: `คุณต้องการเปลี่ยนสถานะการจองเป็น ${statusThai} ใช่หรือไม่?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ใช่, ปรับปรุงเลย!',
          cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
          // Map frontend status values to backend status values
          let backendStatus;
          switch (newStatus) {
            case 'Confirmed':
              backendStatus = 'deposit-paid';
              break;
            case 'Completed':
              backendStatus = 'full-payment';
              break;
            case 'Cancelled':
              backendStatus = 'cancelled';
              break;
            case 'Pending':
              backendStatus = 'pending-deposit';
              break;
            default:
              backendStatus = newStatus;
          }

          const statusData = { status: backendStatus };
          await bookingService.updateBookingStatus(bookingId, statusData);

          // Refresh bookings list
          await loadBookings();

          // Map backend status to Thai display
          const statusThai =
            backendStatus === 'deposit-paid' ? 'ยืนยันแล้ว' :
              backendStatus === 'full-payment' ? 'เสร็จสิ้น' :
                backendStatus === 'cancelled' ? 'ยกเลิก' :
                  'รอดำเนินการ';

          Swal.fire({
            icon: 'success',
            title: 'สถานะถูกอัปเดตแล้ว!',
            text: `สถานะการจองได้ถูกอัปเดตเป็น ${statusThai} เรียบร้อยแล้ว`,
            confirmButtonColor: '#22c55e'
          });
        }
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      Swal.fire({
        icon: 'error',
        title: 'การอัปเดตล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะอัปเดตสถานะการจอง',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Function to delete a booking
  const deleteBooking = async (bookingId) => {
    try {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการลบการจองนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await bookingService.deleteBooking(bookingId);

        // Refresh bookings list
        await loadBookings();

        Swal.fire({
          icon: 'success',
          title: 'ถูกลบแล้ว!',
          text: 'การจองได้ถูกลบเรียบร้อยแล้ว',
          confirmButtonColor: '#22c55e'
        });
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      Swal.fire({
        icon: 'error',
        title: 'การลบล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะลบการจอง',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const getStatusInfo = (status) => {
    // Map backend status to frontend status for styling
    const displayStatus =
      status === 'deposit-paid' ? 'Confirmed' :
        status === 'pending-deposit' ? 'Pending' :
          status === 'full-payment' ? 'Completed' :
            status === 'cancelled' ? 'Cancelled' : status;

    switch (displayStatus) {
      case 'Confirmed':
        return {
          color: 'bg-green-100 text-green-800',
          text: 'จ่ายมัดจำแล้ว',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />
        };
      case 'Pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          text: 'รอดำเนินการ',
          icon: <Clock className="w-4 h-4 text-yellow-600" />
        };
      case 'Completed':
        return {
          color: 'bg-blue-100 text-blue-800',
          text: 'ชำระเต็มจำนวน',
          icon: <CheckCircle className="w-4 h-4 text-blue-600" />
        };
      case 'Cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          text: 'ยกเลิก',
          icon: <XCircle className="w-4 h-4 text-red-600" />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: status,
          icon: <Clock className="w-4 h-4 text-gray-600" />
        };
    }
  };

  const getStatusColor = (status) => {
    return getStatusInfo(status).color;
  };

  const getStatusText = (status) => {
    return getStatusInfo(status).text;
  };

  const getStatusIcon = (status) => {
    return getStatusInfo(status).icon;
  };

  // Function to check if booking status allows menu editing
  const canEditMenu = (status) => {
    return status === 'pending-deposit' || status === 'deposit-paid';
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setDateRange({ start: '', end: '' });
  };

  // Function to view booking details
  const viewBookingDetails = (booking) => {
    // Mark booking as viewed
    const newViewedBookings = new Set([...viewedBookings, booking._id]);
    setViewedBookings(newViewedBookings);
    localStorage.setItem('viewedBookings', JSON.stringify([...newViewedBookings]));

    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Filter bookings based on search term, status, and date range
  const filteredBookings = bookings.filter(booking => {
    // Search term filter - ensure properties exist and are strings before calling toLowerCase
    const matchesSearch =
      (booking.bookingCode && typeof booking.bookingCode === 'string' && booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking._id && typeof booking._id === 'string' && booking._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.customer?.name && typeof booking.customer.name === 'string' && booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.customer?.email && typeof booking.customer.email === 'string' && booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.customer?.phone && typeof booking.customer.phone === 'string' && booking.customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.location?.address && typeof booking.location.address === 'string' && booking.location.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.package?.package_name && typeof booking.package.package_name === 'string' && booking.package.package_name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter - backend uses payment_status field
    const matchesStatus = statusFilter === 'All' || (booking.payment_status === statusFilter);

    // Date range filter - backend uses event_datetime field
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      // Check if booking.event_datetime exists and is valid
      if (!booking.event_datetime) {
        matchesDate = false;
      } else {
        const bookingDate = new Date(booking.event_datetime);
        // Check if the date is valid
        if (isNaN(bookingDate.getTime())) {
          matchesDate = false;
        } else {
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;

          if (startDate && endDate) {
            matchesDate = bookingDate >= startDate && bookingDate <= endDate;
          } else if (startDate) {
            matchesDate = bookingDate >= startDate;
          } else if (endDate) {
            matchesDate = bookingDate <= endDate;
          }
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Function to open the edit menu modal
  const openEditMenuModal = async (booking) => {
    try {
      setLoadingMenus(true);
      setCurrentBookingForMenuEdit(booking);

      // Load available menus
      const menuResponse = await menuService.getAllMenus();
      const menus = menuResponse.data.data || [];

      // Set available menus
      setAvailableMenus(menus);

      // Set currently selected menus from the booking
      const currentMenuSets = booking.menu_sets || [];
      setSelectedMenus(currentMenuSets);

      setShowEditMenuModal(true);
    } catch (error) {
      console.error('Error loading menus:', error);
      Swal.fire({
        icon: 'error',
        title: 'การโหลดข้อมูลล้มเหลว',
        text: 'ไม่สามารถโหลดข้อมูลเมนูได้ กรุณาลองอีกครั้ง',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoadingMenus(false);
    }
  };

  // Function to close the edit menu modal
  const closeEditMenuModal = () => {
    setShowEditMenuModal(false);
    setCurrentBookingForMenuEdit(null);
    setAvailableMenus([]);
    setSelectedMenus([]);
  };

  // Function to handle menu selection
  const handleMenuSelection = (menu) => {
    const isSelected = selectedMenus.some(selected => selected._id === menu._id);

    if (isSelected) {
      // Remove menu if already selected
      setSelectedMenus(prev => prev.filter(selected => selected._id !== menu._id));
    } else {
      // Add menu if not selected
      setSelectedMenus(prev => [...prev, {
        _id: menu._id,
        menu_name: menu.name,
        quantity: 1,
        category: menu.category
      }]);
    }
  };

  // Function to update quantity for a selected menu
  const updateMenuQuantity = (menuId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantities less than 1

    setSelectedMenus(prev =>
      prev.map(menu =>
        menu._id === menuId ? { ...menu, quantity: newQuantity } : menu
      )
    );
  };

  // Function to group menus by category
  const groupMenusByCategory = (menus) => {
    const grouped = {};

    // Define category display names in Thai
    const categoryNames = {
      'appetizer': 'ออเดิร์ฟ',
      'special': 'เมนูพิเศษ',
      'soup': 'ซุป',
      'maincourse': 'จานหลัก',
      'carb': 'ข้าว/เส้น',
      'curry': 'ต้ม/แกง',
      'dessert': 'ของหวาน'
    };

    // Initialize all categories in the required order
    const orderedCategories = ['appetizer', 'special', 'soup', 'maincourse', 'carb', 'curry', 'dessert'];
    orderedCategories.forEach(category => {
      const categoryName = categoryNames[category];
      grouped[categoryName] = [];
    });

    // Group menus by category
    menus.forEach(menu => {
      const category = menu.category || 'other';
      const categoryName = categoryNames[category] || category;

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(menu);
    });

    // Return categories in the specified order
    const result = [];
    orderedCategories.forEach(category => {
      const categoryName = categoryNames[category];
      if (grouped[categoryName] && grouped[categoryName].length > 0) {
        result.push([categoryName, grouped[categoryName]]);
      }
    });

    // Add any other categories that weren't in the predefined list
    Object.entries(grouped).forEach(([categoryName, categoryMenus]) => {
      if (!orderedCategories.some(cat => categoryNames[cat] === categoryName) && categoryMenus.length > 0) {
        result.push([categoryName, categoryMenus]);
      }
    });

    return result;
  };

  // Function to update menu sets for the booking
  const updateBookingMenuSets = async () => {
    if (!currentBookingForMenuEdit) return;

    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: 'คุณต้องการอัปเดตรายการเมนูสำหรับการจองนี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, อัปเดตเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        // Call the API to update menu sets
        await bookingService.updateBookingMenuSets(currentBookingForMenuEdit._id, {
          menu_sets: selectedMenus
        });

        // Close the modal
        closeEditMenuModal();

        // Refresh the main booking details modal
        const updatedBooking = await bookingService.getBookingById(currentBookingForMenuEdit._id);
        setSelectedBooking(updatedBooking.data.data);

        Swal.fire({
          icon: 'success',
          title: 'อัปเดตสำเร็จ!',
          text: 'รายการเมนูได้รับการอัปเดตเรียบร้อยแล้ว',
          confirmButtonColor: '#22c55e'
        });
      }
    } catch (error) {
      console.error('Error updating menu sets:', error);
      Swal.fire({
        icon: 'error',
        title: 'การอัปเดตล้มเหลว',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดขณะอัปเดตรายการเมนู',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการการจอง</h1>
          <p className="text-gray-600">จัดการการจองคิวจัดเลี้ยงและอีเว้นท์</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จำนวนการจองทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จ่ายมัดจำแล้ว</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter(booking => booking.payment_status === 'deposit-paid' && booking.payment_status).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter(booking => booking.payment_status === 'pending-deposit' && booking.payment_status).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">เดือนนี้</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter(booking => {
                  if (!booking.event_datetime) return false;
                  const bookingDate = new Date(booking.event_datetime);
                  const now = new Date();
                  return bookingDate.getMonth() === now.getMonth() &&
                    bookingDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหาการจองด้วย ID, ชื่อลูกค้า, อีเมล, โทรศัพท์, สถานที่ หรือแพ็กเกจ..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">ทุกสถานะ</option>
              <option value="pending-deposit">รอดำเนินการ</option>
              <option value="deposit-paid">จ่ายมัดจำแล้ว</option>
              <option value="full-payment">ชำระเต็มจำนวน</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>

          {/* Date Range Filter and Clear Button */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={clearFilters}
              className="col-span-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
            >
              ล้าง
            </button>
            <div className="col-span-2 grid grid-cols-2 gap-1">
              <input
                type="date"
                placeholder="วันเริ่มต้น"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <input
                type="date"
                placeholder="วันสิ้นสุด"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">รายการการจองทั้งหมด</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสการจอง</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียดอีเว้นท์</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนโต๊ะ/ผู้เข้าร่วม</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking, index) => (
                <tr
                  key={booking._id}
                  className={`hover:bg-gray-50 ${viewedBookings.has(booking._id) ? 'bg-gray-50' : 'bg-green-50'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.bookingCode || booking._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customer?.name || booking.customer || 'ไม่ระบุ'}</div>
                    <div className="text-sm text-gray-600">{booking.customer?.email || 'ไม่ระบุ'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {booking.event_datetime ? new Date(booking.event_datetime).toLocaleDateString() : 'ไม่ระบุ'} เวลา {booking.event_datetime ? new Date(booking.event_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ไม่ระบุ'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {booking.location?.address || 'ไม่ระบุ'}
                    </div>
                    {booking.location?.latitude && booking.location?.longitude && (
                      <div className="text-xs text-gray-500 mt-1">
                        พิกัด: {booking.location.latitude.toFixed(4)}, {booking.location.longitude.toFixed(4)}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{booking.package?.package_name || 'ไม่ระบุ'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {booking.table_count || 0} โต๊ะ<br />
                    <span className="font-medium"> {(typeof booking.total_price === 'object'
                      ? (booking.total_price.$numberDecimal || 0)
                      : (booking.total_price || 0))} บาท</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.payment_status || 'pending-deposit'}
                      onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(booking.payment_status || 'pending-deposit')} border-0 focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="pending-deposit">รอดำเนินการ</option>
                      <option value="deposit-paid">จ่ายมัดจำแล้ว</option>
                      <option value="full-payment">ชำระเต็มจำนวน</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      {/* View Details Button */}
                      <button
                        onClick={() => viewBookingDetails(booking)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Search className="w-4 h-4" />
                      </button>

                      {/* View Map Button
                      {booking.location?.latitude && booking.location?.longitude && (
                        <button
                          onClick={() => viewBookingDetails(booking)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <MapPin className="w-5 h-5" />
                        </button>
                      )}

                      {/* Edit Button */}
                      {/* <button
                        onClick={() => {
                          Swal.fire({
                            icon: "info",
                            title: "แก้ไขการจอง",
                            text: "ยังไม่เปิดให้ใช้งาน",
                            confirmButtonColor: "#3b82f6"
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </button> */}

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteBooking(booking._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบการจองที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {/* Shared Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showModal}
        onClose={closeModal}
        booking={selectedBooking}
        onEditMenu={() => openEditMenuModal(selectedBooking)}
      />

      {/* Edit Menu Modal */}
      {
        showEditMenuModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">แก้ไขเมนูในแพ็กเกจ</h3>
                  <button
                    onClick={closeEditMenuModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loadingMenus ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Available Menus */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">เมนูที่มีอยู่</h4>
                      <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                        {availableMenus.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            ไม่มีเมนูที่สามารถเลือกได้
                          </div>
                        ) : (
                          <div className="p-2">
                            {/* Group menus by category */}
                            {groupMenusByCategory(availableMenus).map(([category, menus]) => (
                              <div key={category} className="mb-4">
                                <h5 className="font-semibold text-gray-800 mb-2 capitalize">{category}</h5>
                                <div className="space-y-2">
                                  {menus.map(menu => {
                                    const isSelected = selectedMenus.some(selected => selected._id === menu._id);
                                    return (
                                      <div
                                        key={menu._id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer ${isSelected
                                          ? 'bg-blue-100 border border-blue-300'
                                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                          }`}
                                        onClick={() => handleMenuSelection(menu)}
                                      >
                                        <div className="flex-1">
                                          <div className="font-medium">{menu.name}</div>
                                          <div className="text-sm text-gray-600">{menu.code} - ฿{typeof menu.price === 'object' ? menu.price.$numberDecimal : menu.price}</div>
                                        </div>
                                        {isSelected && (
                                          <div className="flex items-center">
                                            <button
                                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateMenuQuantity(menu._id, selectedMenus.find(m => m._id === menu._id).quantity - 1);
                                              }}
                                            >
                                              -
                                            </button>
                                            <span className="mx-2">
                                              {selectedMenus.find(m => m._id === menu._id)?.quantity || 1}
                                            </span>
                                            <button
                                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateMenuQuantity(menu._id, selectedMenus.find(m => m._id === menu._id).quantity + 1);
                                              }}
                                            >
                                              +
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Menus */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">เมนูที่เลือก</h4>
                      <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto p-2">
                        {selectedMenus.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            ยังไม่มีเมนูที่เลือก
                          </div>
                        ) : (
                          (() => {
                            const grouped = {};
                            selectedMenus.forEach(m => {
                              const cat = m.category || 'other';
                              if (!grouped[cat]) grouped[cat] = [];
                              grouped[cat].push(m);
                            });

                            const categoryNames = {
                              'appetizer': 'ออเดิร์ฟ',
                              'soup': 'ซุป',
                              'maincourse': 'จานหลัก',
                              'carb': 'ข้าว/เส้น',
                              'curry': 'ต้ม/แกง',
                              'dessert': 'ของหวาน',
                              'special': 'เมนูพิเศษ'
                            };
                            const orderedCategories = ['appetizer', 'soup', 'maincourse', 'carb', 'curry', 'dessert', 'special'];

                            return (
                              <div className="space-y-4">
                                {orderedCategories.map(cat => {
                                  if (!grouped[cat]) return null;
                                  return (
                                    <div key={cat}>
                                      <h5 className="font-semibold text-gray-800 mb-2 border-b pb-1 text-sm">{categoryNames[cat] || cat}</h5>
                                      <div className="space-y-2">
                                        {grouped[cat].map((menu) => (
                                          <div key={menu._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex-1">
                                              <div className="font-medium">{menu.menu_name}</div>
                                              <div className="text-sm text-gray-600">จำนวน: {menu.quantity}</div>
                                            </div>
                                            <button
                                              onClick={() => handleMenuSelection(menu)}
                                              className="text-red-600 hover:text-red-800"
                                            >
                                              <X className="w-5 h-5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                                {Object.keys(grouped).filter(c => !orderedCategories.includes(c)).map(cat => (
                                  <div key={cat}>
                                    <h5 className="font-semibold text-gray-800 mb-2 border-b pb-1 text-sm">{cat}</h5>
                                    <div className="space-y-2">
                                      {grouped[cat].map((menu) => (
                                        <div key={menu._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                          <div className="flex-1">
                                            <div className="font-medium">{menu.menu_name}</div>
                                            <div className="text-sm text-gray-600">จำนวน: {menu.quantity}</div>
                                          </div>
                                          <button
                                            onClick={() => handleMenuSelection(menu)}
                                            className="text-red-600 hover:text-red-800"
                                          >
                                            <X className="w-5 h-5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closeEditMenuModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={updateBookingMenuSets}
                  disabled={loadingMenus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Bookings;