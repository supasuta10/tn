import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { X, Home, Users, ShoppingCart, BarChart3, Settings, LogOut, Utensils, Calendar, Package, Menu, ChefHat, Users2, MapPinned, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const sidebarItems = [
    { path: '/admin/dashboard', icon: Home, label: 'แดชบอร์ด' },
    { path: '/admin/menu', icon: Menu, label: 'จัดการเมนู' },
    { path: '/admin/menu-packages', icon: Package, label: 'ชุดเมนู' },
    // { path: '/admin/categories', icon: Package, label: 'Categories' },
    { path: '/admin/bookings', icon: Calendar, label: 'การจอง' },
    { path: '/admin/customers', icon: Users2, label: 'ลูกค้า' },
  ];

  const logout = async () => {
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

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-green-200">
        <h1 className="text-xl font-bold text-gray-800">ชัยเจริญโภชนา (เอ๋) นครปฐม</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md hover:bg-green-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-8">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center px-6 py-3 text-left hover:bg-green-100 transition-colors ${isActive ? 'bg-green-50 text-green-600 border-r-2 border-green-600' : 'text-gray-600'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          );
        })}

        <button
          onClick={logout}
          className="w-full flex items-center px-6 py-3 text-left hover:bg-green-100 transition-colors text-gray-600 mt-2"
        >
          <LogOut className="w-5 h-5 mr-3" />
          ออกจากระบบ
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;