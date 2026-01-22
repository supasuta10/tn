import React, { useState, useEffect } from "react"; 
import { Link, useLocation } from 'react-router'; 
import UserService from '../../services/UserService'; 
import TextScaleButton from './TextScaleButton';

const CustomerNavbar = () => {
    const location = useLocation();

    // 💡 1. สร้าง State สำหรับเก็บข้อมูลผู้ใช้
    const [user, setUser] = useState({ 
        firstName: 'ลูกค้า', 
        title: 'คุณ' 
    });
    
    // 💡 2. ใช้ useEffect เพื่อดึงข้อมูลผู้ใช้จาก Service
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // ดึงข้อมูลผู้ใช้จาก Service
                const response = await UserService.getUserInfo();
                const userInfoFromService = response.data.data;
                
                // ตั้งค่า State ผู้ใช้
                setUser(userInfoFromService);
                
                // 💡 หมายเหตุ: ควรลบ user ออกจาก localStorage ตั้งแต่ตอน Login
                // เพื่อให้มั่นใจว่าข้อมูลมาจาก Service จริงๆ
                
            } catch (error) {
                console.error('Error fetching user info for Navbar:', error);
                // หากดึงไม่สำเร็จ ให้อิงตามค่าเริ่มต้นใน useState
                
                // อาจจะต้อง Handle กรณี Token หมดอายุ หรือไม่ถูกต้อง
            }
        };

        // หากมีการเก็บ user.role หรือ user._id ใน localStorage
        // เพื่อใช้ยืนยันสถานะการ Login ก่อนเรียก Service
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserInfo();
        }

        // ลบข้อมูล user ที่เคยอยู่ใน localStorage ออก (ถ้ามี)
        localStorage.removeItem('user'); 
        
    }, []); 

    // Function to check if a link is active
    const isActive = (path) => {
        return location.pathname === path ? 'text-green-800 font-semibold' : 'text-green-700';
    };

    // Function to handle logout
    const handleLogout = () => {
        // Clear user session/token
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        // Redirect to login or home
        window.location.href = '/login';
    };

    // 💡 การแสดงชื่อผู้ใช้: ใช้ State `user` ที่ดึงมาจาก Service แล้ว
    const displayName = `${user.title || ''}${user.firstName || 'ลูกค้า'}`;

    return (
        <div className="navbar bg-green-50 shadow-sm border-b border-green-200">
            {/* LEFT */}
            <div className="navbar-start">
                {/* Mobile Dropdown */}
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost text-green-700 lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-green-50 rounded-box z-10 mt-3 w-52 p-2 shadow border border-green-200"
                    >
                        <li><Link to="/customer/dashboard" className={`text-green-700 ${isActive('/customer/dashboard')}`}>แดชบอร์ด</Link></li>
                        <li><Link to="/customer/profile" className={`text-green-700 ${isActive('/customer/profile')}`}>โปรไฟล์ของฉัน</Link></li>
                        <li><Link to="/customer/bookings" className={`text-green-700 ${isActive('/customer/bookings')}`}>การจองของฉัน</Link></li>
                        <li><button onClick={handleLogout} className="text-green-700">ออกจากระบบ</button></li>
                    </ul>
                </div>

                {/* LOGO */}
                <Link to="/customer/dashboard" className="btn btn-ghost text-2xl font-bold text-green-700">
                    ชัยเจริญโภชนา
                </Link>
            </div>

            {/* CENTER (Desktop) */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 text-green-700">
                    <li><Link to="/customer/dashboard" className={isActive('/customer/dashboard')}>แดชบอร์ด</Link></li>
                    <li><Link to="/customer/profile" className={isActive('/customer/profile')}>โปรไฟล์ของฉัน</Link></li>
                    <li><Link to="/customer/bookings" className={isActive('/customer/bookings')}>การจองของฉัน</Link></li>
                </ul>
            </div>

            {/* RIGHT */}
            <div className="navbar-end">
                <div className="navbar-end flex items-center space-x-4">
                    {/* แสดงชื่อผู้ใช้ (ลูกค้า: {displayName}) อาจจะเพิ่มตรงนี้ได้ */}
                    <div className="hidden sm:block text-green-700 text-sm">
                        สวัสดี, {displayName}
                    </div>

                    <TextScaleButton />
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full bg-green-200 flex items-center justify-center">
                                {/* 💡 ใช้ user.firstName.charAt(0) จาก State ที่ดึงมาจาก Service */}
                                <span className="text-green-700 font-bold">
                                    {user.firstName ? user.firstName.charAt(0) : 'ล'}
                                </span> 
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                        >
                            <li>
                                <Link to="/customer/profile" className="justify-between">
                                    <span>โปรไฟล์ของฉัน</span>
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout}>ออกจากระบบ</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerNavbar;