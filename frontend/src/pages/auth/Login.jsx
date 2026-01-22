import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Swal from 'sweetalert2'
import authService from '../../services/AuthService'

const Login = () => {
  const [loginData, setLoginData] = useState({
    login: '',
    password: '',
    rememberMe: false
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  // Validate input fields
  const validateForm = () => {
    const newErrors = {}

    // Validate login field (email or username)
    if (!loginData.login.trim()) {
      newErrors.login = 'กรุณากรอกอีเมลหรือชื่อผู้ใช้'
    } else if (loginData.login.includes('@')) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(loginData.login)) {
        newErrors.login = 'รูปแบบอีเมลไม่ถูกต้อง'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Show loading alert
      Swal.fire({
        title: 'กำลังเข้าสู่ระบบ...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading()
        }
      })

      const response = await authService.login(loginData)
      const userRole = response.data.data.role;
      const token = response.data.data.token
      if (response.data.success) {
        // Store token in localStorage or sessionStorage based on "remember me" option
        if (loginData.rememberMe) {
          localStorage.setItem('token', token)
        } else {
          sessionStorage.setItem('token', token)
        }

        // Store user info
        localStorage.setItem('token', token)
        localStorage.setItem('userRole', userRole)
        localStorage.setItem('username', response.data.data.username)

        // Close loading alert and show success message
        Swal.close()

        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: 'ยินดีต้อนรับกลับเข้าสู่ระบบ',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#10B981'
        })

        switch (userRole) {
          case 'admin':
            navigate('/admin/dashboard')
            break;
          case 'customer':
            navigate('/customer/dashboard')
            break;
          case 'chef':
            navigate('/chef/dashboard')
            break;
          default:
            navigate('/')
            break;
        }

      } else {
        // Close loading alert and show error
        Swal.close()
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบล้มเหลว',
          text: response.data.msg || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#EF4444'
        })
      }
    } catch (error) {
      // Close loading alert and show error
      Swal.close()

      if (error.response) {
        // Server responded with error status
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response.data.msg || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#EF4444'
        })
      } else if (error.request) {
        // Network error
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถเชื่อมต่อได้',
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#EF4444'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
          text: 'กรุณาลองอีกครั้งในภายหลัง',
          confirmButtonText: 'ปิด',
          confirmButtonColor: '#EF4444'
        })
      }
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-green-100">
        <div className="text-center mb-8">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-800">เข้าสู่ระบบ</h1>
          <p className="text-gray-600 mt-2">กรุณากรอกรายละเอียดเพื่อเข้าสู่ระบบ</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="label text-green-700 font-medium">อีเมล/ชื่อผู้ใช้</label>
            <input
              type="text"
              name="login"
              placeholder="กรุณากรอกอีเมลหรือชื่อผู้ใช้ของคุณ"
              className={`input input-bordered w-full bg-white border ${errors.login ? 'border-red-500' : 'border-green-200'} focus:border-green-500 focus:ring-1 focus:ring-green-500`}
              value={loginData.login}
              onChange={handleChange}
            />
            {errors.login && <p className="text-red-500 text-sm mt-1">{errors.login}</p>}
          </div>

          <div>
            <label className="label text-green-700 font-medium">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="กรุณากรอกรหัสผ่านของคุณ"
                className={`input input-bordered w-full bg-white border ${errors.password ? 'border-red-500' : 'border-green-200'} focus:border-green-500 focus:ring-1 focus:ring-green-500`}
                value={loginData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-green-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                className="checkbox checkbox-green"
                checked={loginData.rememberMe}
                onChange={handleChange}
              />
              <span className="ml-2 text-gray-600">จดจำฉัน</span>
            </label>
            <Link to="/forgot-password" className="text-green-600 text-sm hover:underline">ลืมรหัสผ่าน?</Link>
          </div>

          <button
            type="submit"
            className={`btn bg-green-600 text-white hover:bg-green-700 w-full py-3 transition duration-300 ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="divider my-6 text-gray-400">หรือ</div>
        <div className="text-center text-gray-600">
          ยังไม่มีบัญชี? <Link to="/register" className="text-green-600 hover:underline font-medium">ลงทะเบียน</Link>
        </div>
      </div>
    </div>
  )
}

export default Login