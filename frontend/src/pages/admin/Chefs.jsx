import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, UserCheck, UserX, User, ChefHat } from 'lucide-react';
import userService from './../../services/UserService';
import Swal from 'sweetalert2';

const Chefs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load chefs from API when component mounts
  useEffect(() => {
    loadChefs();
  }, []);

  const loadChefs = async () => {
    try {
      setLoading(true);
      // Get all users with chef role
      const response = await userService.searchUserByRole('chef');
      setChefs(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลพ่อครัวได้');
      console.error('Error loading chefs:', err);
      Swal.fire({
        icon: 'error',
        title: 'การโหลดข้อมูลล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะโหลดข้อมูลพ่อครัว',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter chefs based on search term and status
  const filteredChefs = chefs.filter(chef => {
    const matchesSearch = 
      (chef.firstName && chef.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chef.lastName && chef.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chef.email && chef.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chef.phone && chef.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && chef.isActive !== false) || 
                         (filterStatus === 'inactive' && chef.isActive === false);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (isActive) => {
    return isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getAvatarInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const toggleChefStatus = async (chef) => {
    try {
      const currentStatus = chef.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน';
      const newStatus = chef.isActive ? 'ไม่ใช้งาน' : 'ใช้งานอยู่';
      
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการ${chef.isActive ? 'ปิด' : 'เปิด'}การใช้งานพ่อครัว ${chef.title}${chef.firstName} ${chef.lastName} ใช่หรือไม่? ปัจจุบัน: ${currentStatus} → ${newStatus}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: chef.isActive ? '#d33' : '#3085d6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: chef.isActive ? 'ใช่, ปิดการใช้งาน!' : 'ใช่, เปิดการใช้งาน!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await userService.toggleUserStatus(chef._id);

        // Refresh chefs list
        await loadChefs();

        Swal.fire({
          icon: 'success',
          title: chef.isActive ? 'ปิดการใช้งานแล้ว!' : 'เปิดการใช้งานแล้ว!',
          text: `สถานะการใช้งานของ ${chef.title}${chef.firstName} ${chef.lastName} ได้ถูก${chef.isActive ? 'ปิด' : 'เปิด'}เรียบร้อยแล้ว`,
          confirmButtonColor: chef.isActive ? '#22c55e' : '#22c55e'
        });
      }
    } catch (err) {
      console.error('Error toggling chef status:', err);
      Swal.fire({
        icon: 'error',
        title: 'การเปลี่ยนสถานะล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะเปลี่ยนสถานะพ่อครัว',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleEditChef = async (chef) => {
    // Create a form for editing chef details
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขข้อมูลพ่อครัว',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <label for="swal-input-title">คำนำหน้าชื่อ</label>
          <select id="swal-input-title" class="swal2-select" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;">
            <option value="นาย." ${chef.title === 'นาย.' ? 'selected' : ''}>นาย.</option>
            <option value="นาง." ${chef.title === 'นาง.' ? 'selected' : ''}>นาง.</option>
            <option value="น.ส." ${chef.title === 'น.ส.' ? 'selected' : ''}>น.ส.</option>
            <option value="Mr." ${chef.title === 'Mr.' ? 'selected' : ''}>Mr.</option>
            <option value="Ms." ${chef.title === 'Ms.' ? 'selected' : ''}>Ms.</option>
          </select>
          
          <label for="swal-input-firstName">ชื่อ</label>
          <input id="swal-input-firstName" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${chef.firstName || ''}">
          
          <label for="swal-input-lastName">นามสกุล</label>
          <input id="swal-input-lastName" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${chef.lastName || ''}">
          
          <label for="swal-input-email">อีเมล</label>
          <input id="swal-input-email" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${chef.email || ''}">
          
          <label for="swal-input-phone">เบอร์โทร</label>
          <input id="swal-input-phone" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" value="${chef.phone || ''}">
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: document.getElementById('swal-input-title').value,
          firstName: document.getElementById('swal-input-firstName').value,
          lastName: document.getElementById('swal-input-lastName').value,
          email: document.getElementById('swal-input-email').value,
          phone: document.getElementById('swal-input-phone').value
        };
      }
    });

    if (formValues) {
      try {
        // Update the chef (user with chef role)
        await userService.updateUser(chef._id, formValues);

        // Reload chefs list
        await loadChefs();

        Swal.fire({
          icon: 'success',
          title: 'อัปเดตข้อมูลสำเร็จ!',
          text: `ข้อมูลของ ${chef.title}${chef.firstName} ${chef.lastName} ได้รับการอัปเดตเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      } catch (err) {
        console.error('Error updating chef:', err);
        Swal.fire({
          icon: 'error',
          title: 'การอัปเดตล้มเหลว',
          text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะอัปเดตข้อมูลพ่อครัว',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const addChef = async () => {
    // Create a form for adding a new chef
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มพ่อครัวใหม่',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <label for="swal-input-title">คำนำหน้าชื่อ</label>
          <select id="swal-input-title" class="swal2-select" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;">
            <option value="นาย.">นาย.</option>
            <option value="นาง.">นาง.</option>
            <option value="น.ส.">น.ส.</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
          </select>

          <label for="swal-input-firstName">ชื่อ</label>
          <input id="swal-input-firstName" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="กรุณากรอกชื่อ">

          <label for="swal-input-lastName">นามสกุล</label>
          <input id="swal-input-lastName" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="กรุณากรอกนามสกุล">

          <label for="swal-input-email">อีเมล</label>
          <input id="swal-input-email" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="กรุณากรอกอีเมล">

          <label for="swal-input-phone">เบอร์โทร</label>
          <input id="swal-input-phone" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="กรุณากรอกเบอร์โทร">

          <label for="swal-input-username">ชื่อผู้ใช้งาน</label>
          <input id="swal-input-username" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="กรุณากรอกชื่อผู้ใช้งาน">

          <label for="swal-input-password">รหัสผ่าน</label>
          <input type="password" id="swal-input-password" class="swal2-input" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="กรุณากรอกรหัสผ่าน">
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById('swal-input-title').value;
        const firstName = document.getElementById('swal-input-firstName').value;
        const lastName = document.getElementById('swal-input-lastName').value;
        const email = document.getElementById('swal-input-email').value;
        const phone = document.getElementById('swal-input-phone').value;
        const username = document.getElementById('swal-input-username').value;
        const password = document.getElementById('swal-input-password').value;

        if (!title || !firstName || !lastName || !email || !phone || !username || !password) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
          return null;
        }

        return {
          title,
          firstName,
          lastName,
          email,
          phone,
          username,
          password,
          role: 'chef' // Set role as chef for all new chefs
        };
      }
    });

    if (formValues) {
      try {
        // Create the new chef using the user service
        const result = await userService.createUser(formValues);

        // Reload chefs list
        await loadChefs();

        Swal.fire({
          icon: 'success',
          title: 'เพิ่มพ่อครัวสำเร็จ!',
          text: `พ่อครัว ${formValues.title}${formValues.firstName} ${formValues.lastName} ได้ถูกเพิ่มเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      } catch (err) {
        console.error('Error adding chef:', err);
        Swal.fire({
          icon: 'error',
          title: 'การเพิ่มพ่อครัวล้มเหลว',
          text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะเพิ่มพ่อครัวใหม่',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const deleteChef = async (chefId, chefName) => {
    try {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการลบพ่อครัว ${chefName} ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await userService.deleteUser(chefId);

        // Refresh chefs list
        await loadChefs();

        Swal.fire({
          icon: 'success',
          title: 'ถูกลบแล้ว!',
          text: 'พ่อครัวได้ถูกลบเรียบร้อยแล้ว',
          confirmButtonColor: '#22c55e'
        });
      }
    } catch (err) {
      console.error('Error deleting chef:', err);
      Swal.fire({
        icon: 'error',
        title: 'การลบล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะลบพ่อครัว',
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
          <h1 className="text-2xl font-bold text-gray-900">จัดการพ่อครัว</h1>
          <p className="text-gray-600">จัดการข้อมูลพ่อครัวในระบบ</p>
        </div>
        <button
          onClick={addChef}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มพ่อครัวใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหาพ่อครัว (ชื่อ, อีเมล, เบอร์โทร...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ใช้งานอยู่</option>
              <option value="inactive">ไม่ใช้งาน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chefs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">รายชื่อพ่อครัว ({filteredChefs.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">พ่อครัว</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">อีเมล</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">วันที่สมัคร</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredChefs.map((chef) => (
                <tr key={chef._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {getAvatarInitials(chef.firstName, chef.lastName)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {chef.title}{chef.firstName} {chef.lastName}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden">{chef.email}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{chef.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{chef.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chef.isActive)}`}>
                      {chef.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                    {chef.createdAt ? new Date(chef.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          Swal.fire({
                            icon: "info",
                            title: "ดูข้อมูลพ่อครัว",
                            text: `ดูข้อมูลของ ${chef.title}${chef.firstName} ${chef.lastName}`,
                            confirmButtonColor: "#3b82f6"
                          });
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="ดูข้อมูล"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditChef(chef)}
                        className="p-1 hover:bg-gray-100 rounded" 
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {chef.isActive ? (
                        <button 
                          onClick={() => toggleChefStatus(chef)}
                          className="p-1 hover:bg-gray-100 rounded text-orange-600" 
                          title="ปิดใช้งาน"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleChefStatus(chef)}
                          className="p-1 hover:bg-gray-100 rounded text-green-600" 
                          title="เปิดใช้งาน"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteChef(chef._id, `${chef.title}${chef.firstName} ${chef.lastName}`)}
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

export default Chefs;