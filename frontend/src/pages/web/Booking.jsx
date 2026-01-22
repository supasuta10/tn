import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

const Booking = () => {
  const navigate = useNavigate();

  // Check if user is logged in as customer
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');

    if (token && user) {
      // If user is logged in, redirect to customer booking page
      navigate('/customer/booking');
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-8">จองโต๊ะจีน</h1>

        <div className="bg-white p-8 rounded-xl shadow-md border border-green-200 mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-6">ข้อมูลการจอง</h2>

          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">กรุณาเข้าสู่ระบบเพื่อทำการจองโต๊ะจีน</p>
            <button
              onClick={() => navigate('/login')}
              className="btn bg-green-600 text-white hover:bg-green-700"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h2 className="text-xl font-bold text-green-700 mb-4">แจ้งเตือนสำคัญ</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>กรุณาจองล่วงหน้าอย่างน้อย 7 วัน ก่อนวันจัดงาน</li>
            <li>กรณีเลื่อนวันจัดงาน ต้องแจ้งล่วงหน้าอย่างน้อย 3 วัน</li>
            <li>สามารถชำระเงินค่ามัดจำได้หลังจากได้รับการยืนยันการจอง</li>
            <li>กรณีมีปริมาณการสั่งอาหารมากกว่า 10 โต๊ะ แจ้งเพื่อขอรับส่วนลดพิเศษได้</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Booking