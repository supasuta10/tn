import React from "react";
import { Link, useLocation } from 'react-router';
import TextScaleButton from './TextScaleButton';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { user, logout, loading } = useAuth();

    // Function to check if a link is active
    const isActive = (path) => {
        return location.pathname === path ? 'text-green-800 font-semibold' : 'text-green-700';
    };

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
                        <li><Link to="/" className={`text-green-700 ${isActive('/')}`}>หน้าแรก</Link></li>
                        <li><Link to="/booking" className={`text-green-700 ${isActive('/booking')}`}>จองโต๊ะจีน</Link></li>
                        <li><Link to="/calendar" className={`text-green-700 ${isActive('/calendar')}`}>ปฏิทินการจอง</Link></li>
                        <li><Link to="/menu" className={`text-green-700 ${isActive('/menu')}`}>เมนูอาหาร</Link></li>
                        <li>
                            <details>
                                <summary className="text-green-700">ข้อมูลร้าน</summary>
                                <ul className="p-2 bg-green-50 border border-green-200 rounded-box">
                                    <li><Link to="/customer-reviews" className={`text-green-700 ${isActive('/customer-reviews')}`}>รีวิวลูกค้า</Link></li>
                                </ul>
                            </details>
                        </li>
                        <li><Link to="/contact" className={`text-green-700 ${isActive('/contact')}`}>ติดต่อร้าน</Link></li>

                        {/* Mobile Login/Profile */}
                        {user ? (
                            <>
                                <div className="divider my-1"></div>
                                <li><Link to="/customer/dashboard" className="text-green-700 font-medium">แดชบอร์ดลูกค้า</Link></li>
                                <li><a onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="text-red-600">ออกจากระบบ</a></li>
                            </>
                        ) : (
                            <li><Link to="/login" className="text-green-700">เข้าสู่ระบบ</Link></li>
                        )}
                    </ul>
                </div>

                {/* LOGO */}
                <Link to="/" className="btn btn-ghost text-2xl font-bold text-green-700">
                    ชัยเจริญโภชนา
                </Link>
            </div>

            {/* CENTER (Desktop) */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 text-green-700">
                    <li><Link to="/" className={isActive('/')}>หน้าแรก</Link></li>
                    <li><Link to="/booking" className={isActive('/booking')}>จองโต๊ะจีน</Link></li>
                    <li><Link to="/calendar" className={isActive('/calendar')}>ปฏิทินการจอง</Link></li>
                    <li>
                        <details>
                            <summary>ข้อมูลร้าน</summary>
                            <ul className="p-2 bg-green-50 border border-green-200 rounded-box w-40">
                                <li><Link to="/menu" className={isActive('/menu')}>เมนูอาหาร</Link></li>
                                <li><Link to="/customer-reviews" className={`${isActive('/customer-reviews')} text-green-700`}>รีวิวลูกค้า</Link></li>
                            </ul>
                        </details>
                    </li>
                    <li><Link to="/contact" className={isActive('/contact')}>ติดต่อร้าน</Link></li>
                </ul>
            </div>

            {/* RIGHT */}
            <div className="navbar-end">
                <div className="navbar-end flex items-center space-x-4">
                    <TextScaleButton />
                    {!loading && (
                        user ? (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn bg-green-100 text-green-800 hover:bg-green-200 border-green-200 flex items-center gap-2">
                                    <span className="hidden sm:inline text-sm font-normal">
                                        สวัสดี, {user.firstName || 'ลูกค้า'}
                                    </span>
                                    <div className="avatar placeholder">
                                        <div className="bg-green-700 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                            <span className="text-xs font-bold leading-none">{user.firstName ? user.firstName.charAt(0) : 'U'}</span>
                                        </div>
                                    </div>
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-green-100">
                                    <li className="menu-title px-4 py-2 text-xs text-gray-400">บัญชีของฉัน</li>
                                    {user.role === 'admin' && (
                                        <li><Link to="/admin/dashboard" className="text-blue-600 font-semibold">ไปที่หน้าแอดมิน</Link></li>
                                    )}
                                    <li><Link to="/customer/dashboard" className="text-gray-700">แดชบอร์ด</Link></li>
                                    <li><Link to="/customer/profile" className="text-gray-700">แก้ไขข้อมูลส่วนตัว</Link></li>
                                    <li><Link to="/customer/bookings" className="text-gray-700">ประวัติการจอง</Link></li>
                                    <div className="divider my-0"></div>
                                    <li>
                                        <button
                                            onClick={logout}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            ออกจากระบบ
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/login" className="btn bg-green-600 text-white hover:bg-green-700 border-none shadow-md">
                                เข้าสู่ระบบ
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
