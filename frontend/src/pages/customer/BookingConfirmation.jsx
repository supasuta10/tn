import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import CustomerService from '../../services/CustomerService';
import { formatNumber, formatPriceWithCurrency } from '../../utils/priceUtils';

const BookingConfirmation = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await CustomerService.getBookingById(id);

                setBooking(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching booking:', error);
                setLoading(false);
            }
        };

        if (id) {
            fetchBooking();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-green-600"></span>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่พบข้อมูลการจอง</h1>
                    <p className="text-gray-600 mb-6">ไม่สามารถพบข้อมูลการจองที่คุณค้นหาได้</p>
                    <Link to="/customer/bookings" className="btn bg-green-600 text-white hover:bg-green-700">
                        กลับไปยังการจองของฉัน
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md border border-green-200 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-green-800">การจองสำเร็จ</h1>
                        <p className="text-gray-600 mt-2">การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-green-700 mb-4">รายละเอียดการจอง</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">ข้อมูลการจอง</h3>
                                <p className="text-gray-600"><span className="font-medium">รหัสการจอง:</span> {booking.bookingCode || booking._id}</p>
                                <p className="text-gray-600"><span className="font-medium">ชื่อ:</span> {booking.customer.name}</p>
                                <p className="text-gray-600"><span className="font-medium">เบอร์โทร:</span> {booking.customer.phone}</p>
                                <p className="text-gray-600"><span className="font-medium">อีเมล:</span> {booking.customer.email}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">รายละเอียดงาน</h3>
                                <p className="text-gray-600">
                                    <span className="font-medium">วัน/เวลาจัดงาน:</span> {new Date(booking.event_datetime).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                                <p className="text-gray-600"><span className="font-medium">จำนวนโต๊ะ:</span> {formatNumber(booking.table_count)} โต๊ะ</p>
                                <p className="text-gray-600"><span className="font-medium">สถานะ:</span> 
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                        booking.payment_status === 'pending-deposit' ? 'bg-yellow-100 text-yellow-800' :
                                        booking.payment_status === 'deposit-paid' ? 'bg-blue-100 text-blue-800' :
                                        booking.payment_status === 'full-payment' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {booking.payment_status === 'pending-deposit' ? 'รอยืนยัน' : 
                                         booking.payment_status === 'deposit-paid' ? 'จ่ายมัดจำแล้ว' : 
                                         booking.payment_status === 'full-payment' ? 'ชำระเต็มจำนวน' : 
                                         booking.payment_status}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">รายละเอียดแพ็กเกจ</h3>
                            <p className="text-gray-600"><span className="font-medium">ชื่อแพ็กเกจ:</span> {booking.package.package_name}</p>
                            <p className="text-gray-600">
                                <span className="font-medium">ราคารวม:</span>
                                {formatPriceWithCurrency(booking.total_price)}
                            </p>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">ที่อยู่จัดงาน</h3>
                            <p className="text-gray-600">{booking.location.address}</p>
                        </div>

                        {booking.notes && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">หมายเหตุเพิ่มเติม</h3>
                                <p className="text-gray-600">{booking.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="text-lg font-semibold text-green-700 mb-2">ขั้นตอนต่อไป</h3>
                        <ol className="list-decimal pl-5 text-gray-600 space-y-1">
                            <li>พนักงานของเราจะติดต่อกลับเพื่อยืนยันรายละเอียดภายใน 24 ชั่วโมง</li>
                            <li>กรุณาชำระเงินมัดจำภายใน 3 วัน หลังจากได้รับการยืนยัน</li>
                            <li>คุณสามารถติดตามสถานะการจองได้ในหน้า "การจองของฉัน"</li>
                        </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link to="/customer/bookings" className="btn bg-green-600 text-white hover:bg-green-700 flex-1">
                            ดูการจองทั้งหมด
                        </Link>
                        <Link to="/customer/dashboard" className="btn btn-outline border-green-600 text-green-600 hover:bg-green-50 flex-1">
                            กลับไปยังแดชบอร์ด
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;