import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, UserCheck, UserX, User, Users as UsersIcon, ChefHat, Star } from 'lucide-react';
import userService from './../../services/UserService';
import bookingService from './../../services/BookingService';
import Swal from 'sweetalert2';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load users from API when component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Load users with booking counts from the new backend endpoint
      const response = await userService.getUsersWithBookingCounts();
      setUsers(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
      console.error('Error loading data:', err);
      Swal.fire({
        icon: 'error',
        title: 'การโหลดข้อมูลล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะโหลดข้อมูล',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'chef': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <User className="w-4 h-4" />;
      case 'chef': return <ChefHat className="w-4 h-4" />;
      case 'customer': return <UsersIcon className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getAvatarInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const isVIPCustomer = (userId) => {
    // Find the user in the users array and check their isVIP property
    const user = users.find(u => u._id === userId);
    return user && user.isVIP;
  };

  const toggleUserStatus = async (user) => {
    try {
      const currentStatus = user.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน';
      const newStatus = user.isActive ? 'ไม่ใช้งาน' : 'ใช้งานอยู่';

      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการ${user.isActive ? 'ปิด' : 'เปิด'}การใช้งานผู้ใช้งาน ${user.title}${user.firstName} ${user.lastName} ใช่หรือไม่? ปัจจุบัน: ${currentStatus} → ${newStatus}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: user.isActive ? '#d33' : '#3085d6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: user.isActive ? 'ใช่, ปิดการใช้งาน!' : 'ใช่, เปิดการใช้งาน!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await userService.toggleUserStatus(user._id);

        // Refresh users list
        await loadUsers();

        Swal.fire({
          icon: 'success',
          title: user.isActive ? 'ปิดการใช้งานแล้ว!' : 'เปิดการใช้งานแล้ว!',
          text: `สถานะการใช้งานของ ${user.title}${user.firstName} ${user.lastName} ได้ถูก${user.isActive ? 'ปิด' : 'เปิด'}เรียบร้อยแล้ว`,
          confirmButtonColor: user.isActive ? '#22c55e' : '#22c55e'
        });
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      Swal.fire({
        icon: 'error',
        title: 'การเปลี่ยนสถานะล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะเปลี่ยนสถานะผู้ใช้งาน',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleEditUser = async (user) => {
    // Create a form for editing user details
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขข้อมูลผู้ใช้งาน',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <label for="swal-input-title">คำนำหน้าชื่อ</label>
          <select id="swal-input-title" class="swal2-select" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;">
            <option value="นาย." ${user.title === 'นาย.' ? 'selected' : ''}>นาย.</option>
            <option value="นาง." ${user.title === 'นาง.' ? 'selected' : ''}>นาง.</option>
            <option value="น.ส." ${user.title === 'น.ส.' ? 'selected' : ''}>น.ส.</option>
            <option value="Mr." ${user.title === 'Mr.' ? 'selected' : ''}>Mr.</option>
            <option value="Ms." ${user.title === 'Ms.' ? 'selected' : ''}>Ms.</option>
          </select>

          <label for="swal-input-firstName">ชื่อ</label>
          <input id="swal-input-firstName" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${user.firstName || ''}">

          <label for="swal-input-lastName">นามสกุล</label>
          <input id="swal-input-lastName" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${user.lastName || ''}">

          <label for="swal-input-email">อีเมล</label>
          <input id="swal-input-email" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${user.email || ''}">

          <label for="swal-input-phone">เบอร์โทร</label>
          <input id="swal-input-phone" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${user.phone || ''}">

          <label for="swal-input-role">บทบาท</label>
          <select id="swal-input-role" class="swal2-select" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;">
            <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>ลูกค้า</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>แอดมิน</option>
            <option value="chef" ${user.role === 'chef' ? 'selected' : ''}>พ่อครัว</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: document.getElementById('swal-input-title').value,
          firstName: document.getElementById('swal-input-firstName').value,
          lastName: document.getElementById('swal-input-lastName').value,
          email: document.getElementById('swal-input-email').value,
          phone: document.getElementById('swal-input-phone').value,
          role: document.getElementById('swal-input-role').value
        };
      }
    });

    if (formValues) {
      try {
        // Update the user
        await userService.updateUser(user._id, formValues);

        // Reload users list
        await loadUsers();

        Swal.fire({
          icon: 'success',
          title: 'อัปเดตข้อมูลสำเร็จ!',
          text: `ข้อมูลของ ${user.title}${user.firstName} ${user.lastName} ได้รับการอัปเดตเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      } catch (err) {
        console.error('Error updating user:', err);
        Swal.fire({
          icon: 'error',
          title: 'การอัปเดตล้มเหลว',
          text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะอัปเดตข้อมูลผู้ใช้งาน',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const deleteUser = async (userId, userName) => {
    try {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการลบผู้ใช้งาน ${userName} ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await userService.deleteUser(userId);

        // Refresh users list
        await loadUsers();

        Swal.fire({
          icon: 'success',
          title: 'ถูกลบแล้ว!',
          text: 'ผู้ใช้งานได้ถูกลบเรียบร้อยแล้ว',
          confirmButtonColor: '#22c55e'
        });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      Swal.fire({
        icon: 'error',
        title: 'การลบล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะลบผู้ใช้งาน',
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
          <p className="text-gray-600">จัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
        </div>
        {/* <button
          onClick={() => {
            Swal.fire({
              icon: "info",
              title: "เพิ่มผู้ใช้งานใหม่",
              text: "คุณลักษณะนี้ยังไม่เปิดให้ใช้งาน",
              confirmButtonColor: "#3b82f6"
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มผู้ใช้งานใหม่
        </button> */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้งาน (ชื่อ, อีเมล, เบอร์โทร...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">บทบาททั้งหมด</option>
              <option value="admin">แอดมิน</option>
              <option value="customer">ลูกค้า</option>
              <option value="chef">พ่อครัว</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">รายชื่อผู้ใช้งาน ({filteredUsers.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้งาน</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">อีเมล</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">วันที่สมัคร</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {getAvatarInitials(user.firstName, user.lastName)}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.title}{user.firstName} {user.lastName}
                          </div>
                          {user.role === 'customer' && (
                            <>
                              <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                ซื้อ {user.bookingCount || 0} ครั้ง
                              </span>
                              {isVIPCustomer(user._id) && (
                                <Star className="w-4 h-4 ml-2 text-yellow-500 fill-current" />
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden">{user.email}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center">
                      <span className="mr-2">{getRoleIcon(user.role)}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? 'แอดมิน' :
                         user.role === 'chef' ? 'พ่อครัว' :
                         user.role === 'customer' ? 'ลูกค้า' : user.role}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          Swal.fire({
                            icon: "info",
                            title: "ดูข้อมูลผู้ใช้งาน",
                            text: `ดูข้อมูลของ ${user.title}${user.firstName} ${user.lastName}`,
                            confirmButtonColor: "#3b82f6"
                          });
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="ดูข้อมูล"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Implement user editing functionality
                          handleEditUser(user);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className="p-1 hover:bg-gray-100 rounded text-orange-600"
                          title="ปิดใช้งาน"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className="p-1 hover:bg-gray-100 rounded text-green-600"
                          title="เปิดใช้งาน"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user._id, `${user.title}${user.firstName} ${user.lastName}`)}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;