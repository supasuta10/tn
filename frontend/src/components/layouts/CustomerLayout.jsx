import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';

const CustomerLayout = () => {
    // 1. Basic Protection: Check for token
    const token = localStorage.getItem('token');

    // 2. If no token, simple redirect (component will unmount, or use useEffect for stricter router push)
    if (!token) {
        window.location.href = '/login';
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-6 flex-grow">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default CustomerLayout;