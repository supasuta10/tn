import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import authService from '../../services/AuthService';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อ';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุล';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show validation errors using SweetAlert
      const errorMessages = Object.values(errors).join('\n');
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        footer: errorMessages
      });
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      const response = await authService.register(registerData);

      if (response.data.success === false || response.status === 400) {
        Swal.fire({
          icon: 'error',
          title: 'การสมัครสมาชิกล้มเหลว',
          text: response.data.msg || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ!',
          text: 'คุณได้สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            // Clear form after successful registration
            setFormData({
              title: '',
              firstName: '',
              lastName: '',
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              phone: '',
              role: 'customer'
            });
            // Redirect to login
            navigate('/login');
          }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';

      if (error.response) {
        errorMessage = error.response.data.msg || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      } else if (error.request) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      }

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-green-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">ลงทะเบียน</h1>
          <p className="text-gray-600 mt-2">กรุณากรอกรายละเอียดเพื่อสร้างบัญชีผู้ใช้</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-green-700 font-medium">คำนำหน้า</label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="select select-bordered w-full bg-white border-green-200"
              >
                <option value="">เลือกคำนำหน้า</option>
                <option value="นาย.">นาย</option>
                <option value="นาง.">นาง</option>
                <option value="น.ส.">นางสาว</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
              </select>
              {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
            </div>

            <div>
              <label className="label text-green-700 font-medium">ชื่อ</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="กรุณากรอกชื่อของคุณ"
                className="input input-bordered w-full bg-white border-green-200"
              />
              {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
            </div>
          </div>

          <div>
            <label className="label text-green-700 font-medium">นามสกุล</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="กรุณากรอกนามสกุลของคุณ"
              className="input input-bordered w-full bg-white border-green-200"
            />
            {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
          </div>

          <div>
            <label className="label text-green-700 font-medium">ชื่อผู้ใช้</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="กรุณากรอกชื่อผู้ใช้"
              className="input input-bordered w-full bg-white border-green-200"
            />
            {errors.username && <span className="text-red-500 text-sm">{errors.username}</span>}
          </div>

          <div>
            <label className="label text-green-700 font-medium">อีเมล</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="กรุณากรอกอีเมลของคุณ"
              className="input input-bordered w-full bg-white border-green-200"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
          </div>

          <div>
            <label className="label text-green-700 font-medium">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="กรุณากรอกเบอร์โทรศัพท์ของคุณ"
              className="input input-bordered w-full bg-white border-green-200"
            />
            {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
          </div>

          <div>
            <label className="label text-green-700 font-medium">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="กรุณากรอกรหัสผ่านของคุณ"
              className="input input-bordered w-full bg-white border-green-200"
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
          </div>

          <div>
            <label className="label text-green-700 font-medium">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="กรุณายืนยันรหัสผ่านของคุณ"
              className="input input-bordered w-full bg-white border-green-200"
            />
            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
          </div>

          <div className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-green" defaultChecked />
            <label className="label-text ml-2 text-gray-600">
              ฉันยอมรับ <Link to="#" className="text-green-600 underline">เงื่อนไขและข้อตกลง</Link> ทั้งหมด
            </label>
          </div>

          <button
            type="submit"
            className={`btn bg-green-600 text-white hover:bg-green-700 w-full py-3 ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </button>
        </form>

        <div className="divider my-6">หรือ</div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="btn btn-outline text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="btn btn-outline text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div className="text-center text-gray-600">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-green-600 hover:underline">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
