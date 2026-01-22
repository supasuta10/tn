import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import userService from '../../services/UserService';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router';

const Header = ({ setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const currentPage = location.pathname.split('/').pop() || 'dashboard';

  // Get user info on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await userService.getUserInfo();
        setUser(response.data.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // Get notifications - in a real app this would come from an API
  useEffect(() => {
    // Mock notifications
    setNotifications([
      { id: 1, message: 'การจองใหม่จากคุณสมชาย วันที่ 15 ธันวาคม', time: '2 ชั่วโมงที่แล้ว', type: 'booking' },
      { id: 2, message: 'คำขอเปลี่ยนแปลงเมนูใหม่', time: '5 ชั่วโมงที่แล้ว', type: 'menu' },
      { id: 3, message: 'การชำระเงินได้รับการยืนยันแล้ว', time: '1 วันที่แล้ว', type: 'payment' },
    ]);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'ยืนยันการออกจากระบบ',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        // Clear any stored authentication data
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');

        // Navigate to login page
        navigate('/');

        // Show success message
        Swal.fire({
          title: 'ออกจากระบบสำเร็จ!',
          text: 'คุณได้ออกจากระบบเรียบร้อยแล้ว',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Logout failed:', err);
        Swal.fire({
          title: 'ข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดในการออกจากระบบ',
          icon: 'error'
        });
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search term:', searchTerm);
    // Implement search functionality based on current page
  };

  // Get page title based on current route
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/admin/dashboard':
        return 'แดชบอร์ด';
      case '/admin/menu':
        return 'จัดการเมนู';
      case '/admin/menu-packages':
        return 'แพ็กเกจเมนู';
      case '/admin/categories':
        return 'หมวดหมู่';
      case '/admin/bookings':
        return 'การจอง';
      case '/admin/orders':
        return 'คำสั่งซื้อ';
      case '/admin/customers':
        return 'ลูกค้า';
      case '/admin/chefs':
        return 'พ่อครัว';
      case '/admin/locations':
        return 'สถานที่จัดงาน';
      case '/admin/reports':
        return 'รายงาน';
      case '/admin/analytics':
        return 'วิเคราะห์ข้อมูล';
      default:
        return 'หน้าหลัก';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-green-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-green-100 mr-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer hover:bg-green-100 rounded-lg p-2"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user ? user.firstName?.charAt(0) || user.username?.charAt(0) || 'A' : 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {user ? `${user.title}${user.firstName} ${user.lastName}` : 'Admin'}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? user.role : 'Administrator'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </div>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-green-200 z-50">
                <div className="p-4 border-b border-green-200">
                  <p className="font-medium text-gray-800">
                    {user ? `${user.title}${user.firstName} ${user.lastName}` : 'Admin User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user ? user.email : 'admin@example.com'}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to="/admin/profile"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100 flex items-center block"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    โปรไฟล์ของฉัน
                  </Link>
                </div>
                <div className="border-t border-green-200 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-green-100 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;