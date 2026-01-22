import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import userService from '../../services/UserService';
import Swal from 'sweetalert2';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserInfo();
      setUser(response.data.data);
      setEditData({ ...response.data.data });
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      console.error('Error fetching profile:', err);
      Swal.fire({
        icon: 'error',
        title: 'การโหลดข้อมูลล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะโหลดข้อมูลโปรไฟล์',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel edit and reset to original data
      setEditData({ ...user });
    }
    setEditing(!editing);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Prepare update data (only include fields that are different)
      const updateData = {};
      Object.keys(editData).forEach(key => {
        if (editData[key] !== user[key]) {
          updateData[key] = editData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'ไม่มีการเปลี่ยนแปลง',
          text: 'คุณยังไม่ได้เปลี่ยนแปลงข้อมูลใดๆ',
          confirmButtonColor: '#3b82f6'
        });
        setEditing(false);
        return;
      }

      // Update profile
      await userService.updateProfile(updateData);
      
      // Refresh user data
      const response = await userService.getUserInfo();
      setUser(response.data.data);
      setEditData({ ...response.data.data });

      setEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'อัปเดตโปรไฟล์สำเร็จ!',
        text: 'ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตเรียบร้อยแล้ว',
        confirmButtonColor: '#22c55e'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      Swal.fire({
        icon: 'error',
        title: 'การอัปเดตล้มเหลว',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดขณะอัปเดตข้อมูลโปรไฟล์',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user) {
      const firstInitial = user.firstName?.charAt(0) || '';
      const lastInitial = user.lastName?.charAt(0) || '';
      return (firstInitial + lastInitial).toUpperCase() || 'AU';
    }
    return 'AU';
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
          <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
          <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>
        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <button
                onClick={handleSaveProfile}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
              >
                <X className="w-4 h-4 mr-2" />
                ยกเลิก
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              แก้ไขโปรไฟล์
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 -mt-16">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white">
                {getUserInitials()}
              </div>
            </div>
            
            {/* User Information */}
            <div className="flex-1 mt-4 sm:mt-0 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user ? `${user.title}${user.firstName} ${user.lastName}` : 'Loading...'}
                  </h2>
                  <p className="text-gray-600">
                    {user ? user.role === 'admin' ? 'ผู้ดูแลระบบ' : 
                       user.role === 'chef' ? 'พ่อครัว' : 
                       user.role === 'customer' ? 'ลูกค้า' : user.role : 'Loading...'}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ใช้งานอยู่
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>ชื่อผู้ใช้งาน: {user?.username || 'Loading...'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>สมัครเมื่อ: {user ? new Date(user.createdAt).toLocaleDateString('th-TH') : 'Loading...'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลส่วนตัว</h3>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้าชื่อ</label>
              {editing ? (
                <select
                  value={editData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="นาย.">นาย.</option>
                  <option value="นาง.">นาง.</option>
                  <option value="น.ส.">น.ส.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                </select>
              ) : (
                <p className="text-gray-900">{user?.title || 'ไม่ระบุ'}</p>
              )}
            </div>
            
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
              {editing ? (
                <input
                  type="text"
                  value={editData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรุณากรอกชื่อ"
                />
              ) : (
                <p className="text-gray-900">{user?.firstName || 'ไม่ระบุ'}</p>
              )}
            </div>
            
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
              {editing ? (
                <input
                  type="text"
                  value={editData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรุณากรอกนามสกุล"
                />
              ) : (
                <p className="text-gray-900">{user?.lastName || 'ไม่ระบุ'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลติดต่อ</h3>
          
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              {editing ? (
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรุณากรอกอีเมล"
                />
              ) : (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <p className="text-gray-900">{user?.email || 'ไม่ระบุ'}</p>
                </div>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              {editing ? (
                <input
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรุณากรอกเบอร์โทรศัพท์"
                />
              ) : (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <p className="text-gray-900">{user?.phone || 'ไม่ระบุ'}</p>
                </div>
              )}
            </div>
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
              {editing ? (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                  {user?.username || 'ไม่ระบุ'}
                </div>
              ) : (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <p className="text-gray-900">{user?.username || 'ไม่ระบุ'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">เปลี่ยนรหัสผ่าน</h3>
        
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              placeholder="กรุณากรอกรหัสผ่านใหม่"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              placeholder="กรุณายืนยันรหัสผ่านใหม่"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="pt-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;