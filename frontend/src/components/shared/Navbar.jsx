import React from "react";
import { Link, useLocation } from 'react-router';
import TextScaleButton from './TextScaleButton';

const Navbar = () => {
    const location = useLocation();

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
                              <summary>ข้อมูลร้าน</summary>
                              <ul className="p-2 bg-green-50 border border-green-200 rounded-box">
                                  <li><Link to="/customer-reviews" className={`text-green-700 ${isActive('/customer-reviews')}`}>รีวิวลูกค้า</Link></li>
                              </ul>
                          </details>
                        </li>
                        <li><Link to="/contact" className={`text-green-700 ${isActive('/contact')}`}>ติดต่อร้าน</Link></li>
                        <li><a className="text-green-700">เข้าสู่ระบบ</a></li>
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
                            <ul className="p-2 bg-green-50 border border-green-200 rounded-box">
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
                    <Link to="/login" className="btn bg-green-600 text-white hover:bg-green-700">
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
