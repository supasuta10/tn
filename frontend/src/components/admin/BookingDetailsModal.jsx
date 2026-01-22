import React from 'react';
import { X, Calendar, User, MapPin, Phone, Mail, CheckCircle, Clock, XCircle } from 'lucide-react';
import MapDisplay from './../../components/shared/MapDisplay';

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const getStatusInfo = (status) => {
    // Map backend status to frontend status for styling
    const displayStatus =
      status === 'deposit-paid' ? 'Confirmed' :
        status === 'pending-deposit' ? 'Pending' :
          status === 'full-payment' ? 'Completed' :
            status === 'cancelled' ? 'Cancelled' : status;

    switch (displayStatus) {
      case 'Confirmed':
        return {
          color: 'bg-green-100 text-green-800',
          text: 'จ่ายมัดจำแล้ว',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />
        };
      case 'Pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          text: 'รอดำเนินการ',
          icon: <Clock className="w-4 h-4 text-yellow-600" />
        };
      case 'Completed':
        return {
          color: 'bg-blue-100 text-blue-800',
          text: 'ชำระเต็มจำนวน',
          icon: <CheckCircle className="w-4 h-4 text-blue-600" />
        };
      case 'Cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          text: 'ยกเลิก',
          icon: <XCircle className="w-4 h-4 text-red-600" />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: status,
          icon: <Clock className="w-4 h-4 text-gray-600" />
        };
    }
  };

  const getStatusColor = (status) => {
    return getStatusInfo(status).color;
  };

  const getStatusText = (status) => {
    return getStatusInfo(status).text;
  };

  const getStatusIcon = (status) => {
    return getStatusInfo(status).icon;
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">รายละเอียดการจอง</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Booking Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">ข้อมูลการจอง</h4>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">รหัสการจอง:</span>
                  <span className="text-gray-800">{booking.bookingCode || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">วันที่จอง:</span>
                  <span className="text-gray-800">
                    {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">สถานะ:</span>
                  <span className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(booking.payment_status || 'pending-deposit')}`}>
                    {booking.payment_status === 'pending-deposit' ? 'รอดำเนินการ' :
                      booking.payment_status === 'deposit-paid' ? 'ยืนยันแล้ว' :
                        booking.payment_status === 'full-payment' ? 'เสร็จสิ้น' :
                          booking.payment_status === 'cancelled' ? 'ยกเลิก' : 'ไม่ทราบ'}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">ราคารวม:</span>
                  <span className="text-gray-800 font-medium">{typeof booking.total_price === 'object' ? booking.total_price.$numberDecimal : booking.total_price} บาท</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">เงินมัดจำ:</span>
                  <span className="text-gray-800 font-medium">{typeof booking.deposit_required === 'object' ? booking.deposit_required.$numberDecimal : booking.deposit_required} บาท</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">ข้อมูลลูกค้า</h4>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">ชื่อ:</span>
                  <span className="text-gray-800">{booking.customer?.name || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">อีเมล:</span>
                  <span className="text-gray-800">{booking.customer?.email || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">เบอร์โทร:</span>
                  <span className="text-gray-800">{booking.customer?.phone || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Event Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">ข้อมูลอีเว้นท์</h4>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">วันที่จัดงาน:</span>
                  <span className="text-gray-800">
                    {booking.event_datetime ? new Date(booking.event_datetime).toLocaleDateString() : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">เวลาจัดงาน:</span>
                  <span className="text-gray-800">
                    {booking.event_datetime ? new Date(booking.event_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">สถานที่:</span>
                  <span className="text-gray-800">{booking.location?.address || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">จำนวนโต๊ะ:</span>
                  <span className="text-gray-800">{booking.table_count || 0} โต๊ะ</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">คำขอพิเศษ:</span>
                  <span className="text-gray-800">{booking.specialRequest || 'ไม่ระบุ'}</span>
                </div>
              </div>

              {/* Location Map */}
              {booking.location?.latitude && booking.location?.longitude && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">แผนที่สถานที่จัดงาน</h4>
                  <MapDisplay
                    latitude={booking.location.latitude}
                    longitude={booking.location.longitude}
                    address={booking.location.address}
                  />
                </div>
              )}
            </div>

            {/* Package Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">ข้อมูลแพ็กเกจ</h4>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">ชื่อแพ็กเกจ:</span>
                  <span className="text-gray-800">{booking.package?.package_name || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">ราคาต่อโต๊ะ:</span>
                  <span className="text-gray-800">฿{typeof booking.package?.price_per_table === 'object' ? booking.package.price_per_table.$numberDecimal : booking.package?.price_per_table || 0}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32 text-gray-600">ชุดอาหาร:</span>
                  <div className="text-gray-800">
                    {booking.menu_sets && booking.menu_sets.length > 0 ? (
                      booking.menu_sets.map((set, index) => (
                        <div key={index} className="text-sm">{set.menu_name} ({set.quantity})</div>
                      ))
                    ) : (
                      'ไม่ระบุ'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">ข้อมูลการชำระเงิน</h4>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-32 text-gray-600">สถานะการชำระเงิน:</span>
                <span className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(booking.payment_status || 'pending-deposit')}`}>
                  {booking.payment_status === 'pending-deposit' ? 'รอดำเนินการ' :
                    booking.payment_status === 'deposit-paid' ? 'จ่ายมัดจำแล้ว' :
                      booking.payment_status === 'full-payment' ? 'ชำระเต็มจำนวน' :
                        booking.payment_status === 'cancelled' ? 'ยกเลิก' : 'ไม่ทราบ'}
                </span>
              </div>
              {booking.payments && booking.payments.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600 block mb-2">ประวัติการชำระเงิน:</span>
                  <div className="space-y-2">
                    {booking.payments.map((payment, index) => {
                      // Check if payment amount matches required deposit
                      const requiredAmount = typeof booking.deposit_required === 'object'
                        ? parseFloat(booking.deposit_required.$numberDecimal)
                        : parseFloat(booking.deposit_required || 0);
                      const paymentAmount = typeof payment.amount === 'object'
                        ? parseFloat(payment.amount.$numberDecimal)
                        : parseFloat(payment.amount || 0);
                      const isAmountCorrect = payment.payment_type === 'deposit'
                        ? paymentAmount >= requiredAmount
                        : true; // For non-deposit payments, we don't verify amount

                      return (
                        <div key={index} className="flex text-sm">
                          <div className="w-32 text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString()}:
                          </div>
                          <div className={`${!isAmountCorrect ? 'text-red-600' : 'text-gray-800'} ${payment.payment_type === 'deposit' && !isAmountCorrect ? 'bg-red-50 p-1 rounded' : ''}`}>
                            ฿{typeof payment.amount === 'object' ? payment.amount.$numberDecimal : payment.amount || 0} ({payment.payment_type})
                            {payment.payment_type === 'deposit' && !isAmountCorrect && (
                              <div className="text-xs text-red-600 mt-1">
                                * แจ้งเตือน: ชำระ ฿{paymentAmount} แต่ต้องชำระ ฿{requiredAmount}
                              </div>
                            )}
                            {payment.slip_image && (
                              <div className="mt-1">
                                <a href={payment.slip_image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                  ดูหลักฐานการชำระเงิน
                                </a>

                                <img
                                  src={`http://localhost:8080${payment.slip_image}`}
                                  alt={payment.name}
                                  className="rounded-md object-cover w-3xl"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;