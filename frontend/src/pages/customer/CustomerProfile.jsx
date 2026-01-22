import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import CustomerService from '../../services/CustomerService';
import reviewService from '../../services/ReviewService';
import Swal from 'sweetalert2';
import ReviewList from '../../components/shared/ReviewList';

const CustomerProfile = () => {
    const [customerData, setCustomerData] = useState({
        title: "",
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        address: ""
    });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile
                const profileResponse = await CustomerService.getProfile();
                setCustomerData(profileResponse.data.data);

                // Fetch customer reviews
                const reviewsResponse = await reviewService.getReviewsByCustomer(profileResponse.data.data._id);
                setReviews(reviewsResponse.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
                setReviewsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
                <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-green-100">
                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : (
                    <>
                        <div className="flex items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center mr-4">
                                <span className="text-green-700 font-bold text-2xl">{customerData.firstName ? customerData.firstName.charAt(0) : '?'}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{customerData.title} {customerData.firstName} {customerData.lastName}</h2>
                                <p className="text-gray-600">@{customerData.username}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-gray-700 mb-2">คำนำหน้าชื่อ</label>
                                <select
                                    value={customerData.title}
                                    onChange={(e) => setCustomerData({...customerData, title: e.target.value})}
                                    disabled={!editing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${editing ? 'bg-white' : 'bg-gray-100'}`}
                                >
                                    <option value="นาย.">นาย.</option>
                                    <option value="นาง.">นาง.</option>
                                    <option value="น.ส.">น.ส.</option>
                                    <option value="Mr.">Mr.</option>
                                    <option value="Ms.">Ms.</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">ชื่อ</label>
                                <input
                                    type="text"
                                    value={customerData.firstName}
                                    onChange={(e) => setCustomerData({...customerData, firstName: e.target.value})}
                                    disabled={!editing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${editing ? 'bg-white' : 'bg-gray-100'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">นามสกุล</label>
                                <input
                                    type="text"
                                    value={customerData.lastName}
                                    onChange={(e) => setCustomerData({...customerData, lastName: e.target.value})}
                                    disabled={!editing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${editing ? 'bg-white' : 'bg-gray-100'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">ชื่อผู้ใช้งาน</label>
                                <input
                                    type="text"
                                    value={customerData.username}
                                    onChange={(e) => setCustomerData({...customerData, username: e.target.value})}
                                    disabled={!editing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${editing ? 'bg-white' : 'bg-gray-100'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">อีเมล</label>
                                <input
                                    type="email"
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                                    disabled={!editing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${editing ? 'bg-white' : 'bg-gray-100'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                                    disabled={!editing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${editing ? 'bg-white' : 'bg-gray-100'}`}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">ที่อยู่</label>
                            <textarea
                                value={customerData.address || ''}
                                onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                                rows="3"
                                disabled={!editing}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${editing ? 'bg-white' : 'bg-gray-100'}`}
                            ></textarea>
                        </div>

                        <div className="flex space-x-4">
                            {editing ? (
                                <>
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        onClick={async () => {
                                            try {
                                                await CustomerService.updateProfile(customerData);

                                                Swal.fire({
                                                    title: 'สำเร็จ!',
                                                    text: 'อัปเดตโปรไฟล์สำเร็จ',
                                                    icon: 'success',
                                                    confirmButtonText: 'ตกลง',
                                                    confirmButtonColor: '#10b981'
                                                });
                                                setEditing(false);
                                            } catch (error) {
                                                console.error('Error updating profile:', error);
                                                Swal.fire({
                                                    title: 'เกิดข้อผิดพลาด!',
                                                    text: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์',
                                                    icon: 'error',
                                                    confirmButtonText: 'ตกลง',
                                                    confirmButtonColor: '#ef4444'
                                                });
                                            }
                                        }}
                                    >
                                        บันทึกการเปลี่ยนแปลง
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                        onClick={() => {
                                            setEditing(false);
                                            // Reset data to original
                                            const fetchProfile = async () => {
                                                try {
                                                    const response = await CustomerService.getProfile();
                                                    setCustomerData(response.data.data);
                                                } catch (error) {
                                                    console.error('Error fetching profile:', error);
                                                }
                                            };
                                            fetchProfile();
                                        }}
                                    >
                                        ยกเลิก
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    onClick={() => setEditing(true)}
                                >
                                    แก้ไขโปรไฟล์
                                </button>
                            )}

                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow p-6 border border-green-100 mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">รีวิวของฉัน</h2>
                {reviewsLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <span className="loading loading-spinner loading-lg text-green-600"></span>
                        <span className="ml-2">กำลังโหลดรีวิว...</span>
                    </div>
                ) : (
                    <ReviewList reviews={reviews} />
                )}
            </div>
        </div>
    );
};

export default CustomerProfile;