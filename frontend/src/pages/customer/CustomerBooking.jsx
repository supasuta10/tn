import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import CustomerService from '../../services/CustomerService';
import MenuPackageService from '../../services/MenuPackageService';
import MenuService from '../../services/MenuService';
import UserService from '../../services/UserService';
import BookingService from '../../services/BookingService';
import MapPicker from '../../components/shared/MapPicker';
import Swal from 'sweetalert2';
import { formatNumber, formatPrice } from '../../utils/priceUtils';

const CustomerBooking = () => {
    // CalendarView Component
    const CalendarView = ({ dateAvailability, maxBookingsPerDay, selectedDate, onDateSelect, viewYear, viewMonth, setViewYear, setViewMonth }) => {
        const today = new Date();

        // Get days in month
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        // Get first day of month (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

        // Create day cells
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="p-2 text-center"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(viewYear, viewMonth, day);
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Format: YYYY-MM-DD
            const bookingCount = dateAvailability[dateStr] || 0;

            let bgColor = 'bg-gray-100'; // Default for past dates
            let textColor = 'text-gray-400';
            let isDisabled = true;

            // Check if this date is today or in the future
            if (date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                if (bookingCount === 0) {
                    bgColor = 'bg-green-500 hover:bg-green-600'; // Available
                    textColor = 'text-white';
                    isDisabled = false;
                } else if (bookingCount === 1) {
                    bgColor = 'bg-yellow-500 hover:bg-yellow-600'; // 1 booking
                    textColor = 'text-white';
                    isDisabled = false;
                } else if (bookingCount >= maxBookingsPerDay) {
                    bgColor = 'bg-red-500'; // Fully booked
                    textColor = 'text-white';
                    isDisabled = true;
                }
            }

            // Check if this date is currently selected
            const isSelected = selectedDate &&
                new Date(selectedDate).toDateString() === date.toDateString();

            days.push(
                <button
                    key={day}
                    onClick={() => !isDisabled && onDateSelect(date)}
                    disabled={isDisabled}
                    className={`
                        p-2 text-center rounded-full transition-colors
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${bgColor} ${textColor}
                        w-10 h-10 flex items-center justify-center
                    `}
                >
                    {day}
                </button>
            );
        }

        const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

        return (
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => {
                            // Reset to current month
                            const currentMonth = new Date();
                            setViewYear(currentMonth.getFullYear());
                            setViewMonth(currentMonth.getMonth());
                        }}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                        title="กลับไปเดือนปัจจุบัน"
                    >
                        ปัจจุบัน
                    </button>
                    <button
                        onClick={() => {
                            const prevMonth = new Date(viewYear, viewMonth - 1, 1);
                            setViewYear(prevMonth.getFullYear());
                            setViewMonth(prevMonth.getMonth());
                        }}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h4 className="text-lg font-semibold">
                        {new Date(viewYear, viewMonth).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                        onClick={() => {
                            const nextMonth = new Date(viewYear, viewMonth + 1, 1);
                            setViewYear(nextMonth.getFullYear());
                            setViewMonth(nextMonth.getMonth());
                        }}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((dayName, index) => (
                        <div key={index} className="text-center font-medium text-gray-700 p-1">
                            {dayName}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        );
    };

    const navigate = useNavigate();
    const location = useLocation();
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [bookingData, setBookingData] = useState({
        customer: {
            name: '',
            phone: '',
            email: ''
        },
        customerID: '',
        event_datetime: '',
        table_count: '',
        package: {
            packageID: '',
            package_name: '',
            price_per_table: ''
        },
        location: {
            address: '',
            latitude: null,
            longitude: null
        },
        menu_sets: [],
        notes: ''
    });
    const [menuPackages, setMenuPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [dateAvailability, setDateAvailability] = useState({});
    const [maxBookingsPerDay] = useState(2); // Maximum 2 bookings per day
    const [allMenus, setAllMenus] = useState([]);
    const [selectedMenuSets, setSelectedMenuSets] = useState([]);
    const [showMenuSelection, setShowMenuSelection] = useState(false);
    const [packageMenus, setPackageMenus] = useState([]);
    const [autoSelectPackageMenus, setAutoSelectPackageMenus] = useState(true); // New state to track if we should auto-select package menus

    useEffect(() => {
        const fetchMenuPackages = async () => {
            try {
                const response = await MenuPackageService.getAllMenuPackages();
                setMenuPackages(response.data.data);

                // Check if there's a selected package from navigation state
                const selectedPackageId = location.state?.selectedPackage;
                if (selectedPackageId) {
                    const selectedPackage = response.data.data.find(pkg => pkg._id === selectedPackageId);
                    if (selectedPackage) {
                        // Set the selected package in booking data
                        const priceValue = typeof selectedPackage.price === 'object'
                            ? selectedPackage.price.$numberDecimal
                            : selectedPackage.price;

                        setBookingData(prev => ({
                            ...prev,
                            package: {
                                packageID: selectedPackage._id,
                                package_name: selectedPackage.name,
                                price_per_table: priceValue
                            }
                        }));

                        // Set package menus when package is selected
                        if (selectedPackage.menus && selectedPackage.menus.length > 0) {
                            setPackageMenus(selectedPackage.menus);

                            // Auto-select package menus if autoSelectPackageMenus is true
                            if (autoSelectPackageMenus) {
                                // We'll auto-select after allMenus are loaded
                            }
                        }
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching menu packages:', error);
                setLoading(false);
            }
        }
        fetchMenuPackages();

        const fetchAllMenus = async () => {
            try {
                const menuResponse = await MenuService.getAllMenus();
                if (menuResponse.data && menuResponse.data.data) {
                    const activeMenus = menuResponse.data.data.filter(menu => menu.active); // Only active menus
                    setAllMenus(activeMenus);
                }
            } catch (error) {
                console.error('Error fetching menus:', error);
            }
        };
        fetchAllMenus();

        const fetchUserInfo = async () => {
            try {
                const response = await UserService.getUserInfo();
                const user = response.data.data;

                setUserInfo(user);
                setBookingData(prev => ({
                    ...prev,
                    customer: { // ข้อมูลสำหรับฟอร์ม
                        name: `${user.title || ''}${user.firstName} ${user.lastName}`,
                        phone: user.phone,
                        email: user.email
                    },
                    customerID: user._id
                }))
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        }
        fetchUserInfo();

        // Fetch date availability to check which dates are fully booked
        const fetchDateAvailability = async () => {
            try {
                const response = await BookingService.getDateAvailability();
                setDateAvailability(response.data.data);
            } catch (error) {
                console.error('Error fetching date availability:', error);
                // If there's an error, we can still proceed without the availability data
                setDateAvailability({});
            }
        }
        fetchDateAvailability();
    }, [location.state]);

    // Effect to auto-select package menus when package is selected and auto-select is enabled
    useEffect(() => {
        if (autoSelectPackageMenus && bookingData.package.packageID && allMenus.length > 0 && menuPackages.length > 0) {
            const selectedPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);
            if (selectedPackage && selectedPackage.menus && selectedPackage.menus.length > 0) {
                const packageMenuItems = selectedPackage.menus.map(menuId => {
                    // Find the actual menu object from allMenus
                    const menuObj = allMenus.find(m =>
                        typeof menuId === 'object' ? m._id === menuId._id : m._id === menuId
                    );
                    return {
                        menu_name: menuObj ? menuObj.name : 'เมนูไม่ทราบชื่อ',
                        quantity: 1
                    };
                });

                setSelectedMenuSets(packageMenuItems);
            }
        }
    }, [autoSelectPackageMenus, bookingData.package.packageID, allMenus, menuPackages]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('customer.')) {
            const field = name.split('.')[1];
            setBookingData(prev => ({
                ...prev,
                customer: {
                    ...prev.customer,
                    [field]: value
                }
            }));
        } else if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setBookingData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [field]: value
                }
            }));
        } else {
            setBookingData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePackageChange = (e) => {
        const selectedPackage = menuPackages.find(pkg => pkg._id === e.target.value);

        if (selectedPackage) {
            //  การแก้ไข: ดึงค่าที่เป็น String จาก $numberDecimal หรือใช้ค่าตรงๆ
            const priceValue = typeof selectedPackage.price === 'object'
                ? selectedPackage.price.$numberDecimal
                : selectedPackage.price;

            setBookingData(prev => ({
                ...prev,
                package: {
                    packageID: selectedPackage._id,
                    package_name: selectedPackage.name,
                    //  เก็บราคาเป็น String/Number ที่ใช้งานได้แล้ว
                    price_per_table: priceValue
                }
            }));

            // Set package menus when package is selected
            if (selectedPackage.menus && selectedPackage.menus.length > 0) {
                setPackageMenus(selectedPackage.menus);

                // Auto-select package menus if autoSelectPackageMenus is true
                if (autoSelectPackageMenus) {
                    const packageMenuItems = selectedPackage.menus.map(menuId => {
                        // Find the actual menu object from allMenus
                        const menuObj = allMenus.find(m =>
                            typeof menuId === 'object' ? m._id === menuId._id : m._id === menuId
                        );
                        return {
                            menu_name: menuObj ? menuObj.name : 'เมนูไม่ทราบชื่อ',
                            quantity: 1
                        };
                    });

                    setSelectedMenuSets(packageMenuItems);
                }
            } else {
                setPackageMenus([]);
                setSelectedMenuSets([]);
            }

            setShowMenuSelection(true);
        }
    };

    // Function to add menu to selection
    const addToSelectedMenu = (menu) => {
        // If auto-select is enabled, disable it when user manually adds a menu
        if (autoSelectPackageMenus) {
            setAutoSelectPackageMenus(false);
        }

        // Check if current package is in 3000-3500 range
        const currentPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);
        const packagePrice = currentPackage ?
            (typeof currentPackage.price === 'object' ?
                parseFloat(currentPackage.price.$numberDecimal) :
                parseFloat(currentPackage.price)) : 0;
        const maxSelections = (packagePrice >= 3000 ) ? 11 : 10;

        if (selectedMenuSets.length >= maxSelections) {
            Swal.fire({
                title: 'ไม่สามารถเลือกได้!',
                text: `สามารถเลือกได้สูงสุด ${maxSelections} อย่างเท่านั้น`,
                icon: 'warning',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Check if menu is already selected
        if (!selectedMenuSets.some(m => m.menu_name === menu.name)) {
            setSelectedMenuSets(prev => [...prev, {
                menu_name: menu.name,
                quantity: 1
            }]);
        }
    };

    // Function to remove menu from selection
    const removeSelectedMenu = (index) => {
        // If auto-select is enabled, disable it when user manually removes a menu
        if (autoSelectPackageMenus) {
            setAutoSelectPackageMenus(false);
        }
        setSelectedMenuSets(prev => prev.filter((_, i) => i !== index));
    };

    // Function to calculate total price with additional menu costs
    const calculateTotalPriceWithMenuAdditions = () => {
        let basePrice = 0;
        if (bookingData.package.price_per_table && bookingData.table_count) {
            basePrice = parseFloat(bookingData.package.price_per_table) * parseInt(bookingData.table_count);
        }

        // Calculate additional cost for menus beyond the included 8
        let additionalCost = 0;
        if (selectedMenuSets.length > 8) {
            const extraMenus = selectedMenuSets.length - 8;
            additionalCost = extraMenus * 200 * bookingData.table_count; // 200 THB per extra menu per table
        }

        return basePrice + additionalCost;
    };

    const calculateTotalPrice = () => {
        return calculateTotalPriceWithMenuAdditions();
    };

    // Function to check if a date is available (has less than max bookings)
    const isDateAvailable = (dateString) => {
        if (!dateString) return true; // If no date selected, assume available

        // Convert the datetime string to just the date part (YYYY-MM-DD)
        const date = new Date(dateString);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const currentBookings = dateAvailability[dateKey] || 0;
        return currentBookings < maxBookingsPerDay;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate menu selection - at least 8 menus must be selected
        // Check if current package is in 3000-3500 range for max selection validation
        const currentPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);
        const packagePrice = currentPackage ?
            (typeof currentPackage.price === 'object' ?
                parseFloat(currentPackage.price.$numberDecimal) :
                parseFloat(currentPackage.price)) : 0;
        const maxSelections = (packagePrice >= 3000 ) ? 11 : 10;

        // If auto-select is enabled, ensure we have the package menus selected
        if (showMenuSelection && autoSelectPackageMenus && currentPackage && currentPackage.menus) {
            // When auto-select is enabled, we should have the package menus already selected
            // So we don't need to validate minimum selections since they're automatically selected
        } else if (showMenuSelection && !autoSelectPackageMenus && selectedMenuSets.length < 8) {
            // Only validate minimum selections when user is manually selecting menus
            Swal.fire({
                title: 'กรุณาเลือกเมนูให้ครบ!',
                text: `ต้องเลือกอย่างน้อย 8 อย่าง (คุณเลือก ${selectedMenuSets.length} อย่าง)`,
                icon: 'warning',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (showMenuSelection && selectedMenuSets.length > maxSelections) {
            Swal.fire({
                title: 'เลือกเมนูมากเกินไป!',
                text: `คุณเลือกเมนูทั้งหมด ${selectedMenuSets.length} อย่าง ซึ่งเกินจำนวนสูงสุดที่อนุญาต ${maxSelections} อย่าง`,
                icon: 'warning',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (!agreed) {
            Swal.fire({
                title: 'กรุณาตกลงเงื่อนไข!',
                text: 'กรุณาตกลงเงื่อนไขและข้อตกลงก่อนดำเนินการต่อ',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Check if selected date is available
        if (!isDateAvailable(bookingData.event_datetime)) {
            Swal.fire({
                title: 'วันที่ไม่ว่าง!',
                text: 'วันที่คุณเลือกมีการจองเต็มแล้ว กรุณาเลือกวันอื่น',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Check if location is selected
        if (!bookingData.location.latitude || !bookingData.location.longitude) {
            Swal.fire({
                title: 'กรุณาเลือกตำแหน่ง!',
                text: 'กรุณาเลือกตำแหน่งที่อยู่จัดงานบนแผนที่',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        try {
            // Prepare booking data for submission
            const bookingPayload = {
                customer: {
                    customerID: bookingData.customerID,
                    name: bookingData.customer.name,
                    phone: bookingData.customer.phone,
                    email: bookingData.customer.email
                },
                packageId: bookingData.package.packageID,
                event_datetime: new Date(bookingData.event_datetime).toISOString(),
                table_count: parseInt(bookingData.table_count),
                location: {
                    address: bookingData.location.address,
                    latitude: bookingData.location.latitude,
                    longitude: bookingData.location.longitude
                },
                menu_sets: selectedMenuSets, // Include selected menu sets
                specialRequest: bookingData.notes,
                // Calculate deposit required (e.g., 30% of total)
                deposit_required: calculateTotalPrice() * 0.3
            };

            const response = await CustomerService.createBooking(bookingPayload);

            // Navigate directly to payment page after successful booking
            navigate(`/customer/booking/${response.data.data._id}`);
        } catch (error) {
            console.error('Error creating booking:', error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง',
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-green-600"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-green-800 text-center mb-8">จองโต๊ะจีน</h1>

                <div className="bg-white p-8 rounded-xl shadow-md border border-green-200 mb-8">
                    <h2 className="text-2xl font-bold text-green-700 mb-6">ข้อมูลการจอง</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Customer Information Section */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-green-700 mb-4">ข้อมูลลูกค้า</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label text-green-700 font-medium">ชื่อ-นามสกุล</label>
                                    <input
                                        type="text"
                                        name="customer.name"
                                        value={bookingData.customer.name}
                                        onChange={handleInputChange}
                                        placeholder="กรุณากรอกชื่อ-นามสกุลของคุณ"
                                        className="input input-bordered w-full bg-white border-green-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label text-green-700 font-medium">เบอร์โทรศัพท์</label>
                                    <input
                                        type="tel"
                                        name="customer.phone"
                                        value={bookingData.customer.phone}
                                        onChange={handleInputChange}
                                        placeholder="กรุณากรอกเบอร์โทรศัพท์"
                                        className="input input-bordered w-full bg-white border-green-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label text-green-700 font-medium">อีเมล</label>
                                    <input
                                        type="email"
                                        name="customer.email"
                                        value={bookingData.customer.email}
                                        onChange={handleInputChange}
                                        placeholder="กรุณากรอกอีเมลของคุณ"
                                        className="input input-bordered w-full bg-white border-green-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Booking Details Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label text-green-700 font-medium">วันที่ต้องการจัด</label>
                                <input
                                    type="datetime-local"
                                    name="event_datetime"
                                    value={bookingData.event_datetime}
                                    onChange={handleInputChange}
                                    className={`input input-bordered w-full bg-white border-green-200 ${bookingData.event_datetime && !isDateAvailable(bookingData.event_datetime) ? 'border-red-500 bg-red-50' : ''}`}
                                    min={new Date().toISOString().slice(0, 16)} // Only allow future dates
                                    required
                                />
                                {bookingData.event_datetime && !isDateAvailable(bookingData.event_datetime) && (
                                    <p className="text-red-500 text-sm mt-1">วันที่นี้มีการจองเต็มแล้ว (จองได้สูงสุด {maxBookingsPerDay} ครั้งต่อวัน)</p>
                                )}
                            </div>

                            <div>
                                <label className="label text-green-700 font-medium">จำนวนโต๊ะ</label>
                                <input
                                    type="number"
                                    name="table_count"
                                    value={bookingData.table_count}
                                    onChange={handleInputChange}
                                    placeholder="กรุณากรอกจำนวนโต๊ะ"
                                    min="1"
                                    className="input input-bordered w-full bg-white border-green-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Calendar View for Date Availability */}
                        <div className="mt-8 bg-white p-6 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-green-700 mb-4">ปฏิทินแสดงวันที่สามารถจองได้</h3>

                            {/* Calendar Legend */}
                            <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm">วันที่สามารถจองได้</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                                    <span className="text-sm">จองแล้ว 1 ครั้ง</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                                    <span className="text-sm">จองเต็ม (2 ครั้ง)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                                    <span className="text-sm">วันที่ผ่านมา</span>
                                </div>
                            </div>

                            {/* Calendar Component */}
                            <div className="calendar-container">
                                <CalendarView
                                    dateAvailability={dateAvailability}
                                    maxBookingsPerDay={maxBookingsPerDay}
                                    selectedDate={bookingData.event_datetime}
                                    onDateSelect={(date) => {
                                        // Convert date to datetime-local format (YYYY-MM-DDTHH:mm)
                                        const formattedDate = new Date(date).toISOString().slice(0, 16);
                                        setBookingData(prev => ({
                                            ...prev,
                                            event_datetime: formattedDate
                                        }));
                                    }}
                                    viewYear={viewYear}
                                    viewMonth={viewMonth}
                                    setViewYear={setViewYear}
                                    setViewMonth={setViewMonth}
                                />
                            </div>
                        </div>

                        {/* Package Selection */}
                        <div>
                            <label className="label text-green-700 font-medium">ชื่อชุดโต๊ะจีน</label>
                            <select
                                name="package"
                                value={bookingData.package.packageID}
                                onChange={handlePackageChange}
                                className="select select-bordered w-full bg-white border-green-200"
                                required
                            >
                                <option value="" disabled>เลือกชื่อชุดโต๊ะจีน</option>
                                {menuPackages?.map(pkg => (
                                    <option key={pkg._id} value={pkg._id}>
                                        {pkg.name} - {typeof pkg.price === 'object'
                                            ? `${pkg.price.$numberDecimal} บาท/โต๊ะ`
                                            : `${pkg.price} บาท/โต๊ะ`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Auto-select option - Always visible */}
                        <div className="bg-white p-6 rounded-lg border border-green-200 mt-6">
                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="autoSelectMenus"
                                        checked={autoSelectPackageMenus}
                                        onChange={(e) => {
                                            setAutoSelectPackageMenus(e.target.checked);
                                            if (e.target.checked && bookingData.package.packageID) {
                                                // Auto-select package menus when checkbox is checked
                                                const selectedPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);
                                                if (selectedPackage && selectedPackage.menus && selectedPackage.menus.length > 0) {
                                                    const packageMenuItems = selectedPackage.menus.map(menuId => {
                                                        // Find the actual menu object from allMenus
                                                        const menuObj = allMenus.find(m =>
                                                            typeof menuId === 'object' ? m._id === menuId._id : m._id === menuId
                                                        );
                                                        return {
                                                            menu_name: menuObj ? menuObj.name : 'เมนูไม่ทราบชื่อ',
                                                            quantity: 1
                                                        };
                                                    });

                                                    setSelectedMenuSets(packageMenuItems);
                                                }
                                            } else if (!e.target.checked) {
                                                // Clear selections when checkbox is unchecked
                                                setSelectedMenuSets([]);
                                            }
                                        }}
                                        className="checkbox checkbox-green mr-2"
                                    />
                                    <label htmlFor="autoSelectMenus" className="text-green-700">
                                        ใช้เมนูตามแพ็กเกจ (เลือกอัตโนมัติ)
                                    </label>
                                </div>
                            </div>

                            {/* Menu Selection Interface - Appears after package selection when not auto-selecting */}
                            {showMenuSelection && bookingData.package.packageID && !autoSelectPackageMenus && (
                                <div>
                                    {(() => {
                                        // Check if current package is in 3000-3500 range
                                        const currentPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);
                                        const packagePrice = currentPackage ?
                                            (typeof currentPackage.price === 'object' ?
                                                parseFloat(currentPackage.price.$numberDecimal) :
                                                parseFloat(currentPackage.price)) : 0;
                                        const maxSelections = (packagePrice >= 3000 ) ? 11 : 10;
                                        return (
                                            <h3 className="text-lg font-semibold text-green-700 mb-4">เลือกรายการอาหาร ({selectedMenuSets.length}/{maxSelections})</h3>
                                        );
                                    })()}

                                <div className="mb-4">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <p className="text-blue-800">
                                            <strong>แพ็กเกจ:</strong> {bookingData.package.package_name} |
                                            <strong> ราคาต่อโต๊ะ:</strong> {bookingData.package.price_per_table} บาท |
                                            <strong> จำนวนโต๊ะ:</strong> {bookingData.table_count} โต๊ะ
                                        </p>
                                        <p className="text-blue-800 mt-1">
                                            {(() => {
                                                // Check if current package is in 3000-3500 range
                                                const currentPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);
                                                const packagePrice = currentPackage ?
                                                    (typeof currentPackage.price === 'object' ?
                                                        parseFloat(currentPackage.price.$numberDecimal) :
                                                        parseFloat(currentPackage.price)) : 0;
                                                const isSpecialRange = packagePrice >= 3000 ;
                                                return isSpecialRange ? (
                                                    <span>สามารถเลือก <strong>8 อย่าง</strong> ได้ฟรี | สามารถเพิ่มได้สูงสุด <strong>อีก 2 อย่าง</strong> + <strong>เมนูพิเศษ 1 อย่าง</strong> (รวมทั้งหมด <strong>11 อย่าง</strong>)</span>
                                                ) : (
                                                    <span>สามารถเลือก <strong>8 อย่าง</strong> ได้ฟรี | สามารถเพิ่มได้สูงสุด <strong>อีก 2 อย่าง</strong> (รวมทั้งหมด 10 อย่าง)</span>
                                                );
                                            })()}
                                        </p>
                                        <p className="text-blue-800 mt-1">
                                            <strong>ค่าอาหารเพิ่มเติม:</strong> 200 บาท/อย่าง/โต๊ะ
                                        </p>
                                    </div>

                                    {/* Legend for menu highlighting */}
                                    <div className="flex flex-wrap gap-4 mt-3">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded mr-2"></div>
                                            <span className="text-sm">เมนูในแพ็คเกจ</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-green-100 border border-green-500 rounded mr-2"></div>
                                            <span className="text-sm">เมนูที่เลือกแล้ว</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="label text-green-700 font-medium">เมนูที่เลือกแล้ว ({selectedMenuSets.length} อย่าง)</label>
                                    <div className="flex flex-wrap gap-2 mb-4 min-h-12 p-2 bg-gray-50 rounded border">
                                        {selectedMenuSets.map((menu, index) => (
                                            <div key={index} className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                {menu.menu_name}
                                                {!autoSelectPackageMenus && ( // Only show remove button when not auto-selecting
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSelectedMenu(index)}
                                                        className="ml-2 text-red-600 hover:text-red-800"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {selectedMenuSets.length === 0 && (
                                            <span className="text-gray-500 text-sm">ยังไม่ได้เลือกเมนู</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="label text-green-700 font-medium">เลือกรายการอาหารตามหมวดหมู่ (เลือกได้ 1-2 อย่างต่อหมวด)</label>
                                    {/* Group menus by category */}
                                    {(() => {
                                        // Check if current package is in 3000-3500 range
                                        const currentPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);
                                        const packagePrice = currentPackage ?
                                            (typeof currentPackage.price === 'object' ?
                                                parseFloat(currentPackage.price.$numberDecimal) :
                                                parseFloat(currentPackage.price)) : 0;
                                        const isSpecialRange = packagePrice >= 3000 ;

                                        // Special menu items for 3000-3500 range
                                        const specialMenuItems = isSpecialRange ? [
                                            {
                                                _id: 'special-1',
                                                name: 'ข้าวเกรียบ+เฟรนฟราย',
                                                description: 'เมนูพิเศษสำหรับช่วงราคา 3000 ขึ้นไป',
                                                category: 'special'
                                            },
                                            {
                                                _id: 'special-2',
                                                name: 'แปะก๊วยคั่วเกลือ',
                                                description: 'เมนูพิเศษสำหรับช่วงราคา 3000 ขึ้นไป',
                                                category: 'special'
                                            },
                                            {
                                                _id: 'special-3',
                                                name: 'เผือกหิมะ',
                                                description: 'เมนูพิเศษสำหรับช่วงราคา 3000 ขึ้นไป',
                                                category: 'special'
                                            }
                                        ] : [];

                                        // Get all menus from packages with prices <= selected package price (lower than or equal to)
                                        // This includes the selected package's menus AND menus from packages with prices < X
                                        // Use the existing currentPackage variable defined above
                                        const currentPackagePrice = currentPackage ?
                                            (typeof currentPackage.price === 'object' ?
                                                parseFloat(currentPackage.price.$numberDecimal) :
                                                parseFloat(currentPackage.price)) : 0;

                                        // Get all menus from packages with prices <= current package price
                                        const eligibleMenus = new Set();
                                        menuPackages.forEach(pkg => {
                                            const pkgPrice = typeof pkg.price === 'object' ?
                                                parseFloat(pkg.price.$numberDecimal) :
                                                parseFloat(pkg.price);

                                            if (pkgPrice <= currentPackagePrice) {
                                                if (pkg.menus && pkg.menus.length > 0) {
                                                    pkg.menus.forEach(menu => {
                                                        const menuId = typeof menu === 'object' ? menu._id : menu;
                                                        eligibleMenus.add(menuId);
                                                    });
                                                }
                                            }
                                        });

                                        // Filter allMenus to only include eligible menus
                                        const filteredMenus = allMenus.filter(menu =>
                                            eligibleMenus.has(menu._id)
                                        );

                                        // Group eligible menus by category
                                        const menusByCategory = {};

                                        // Add special menu items first if in special range
                                        if (isSpecialRange) {
                                            menusByCategory.special = specialMenuItems;
                                        }

                                        filteredMenus.forEach(menu => {
                                            if (!menusByCategory[menu.category]) {
                                                menusByCategory[menu.category] = [];
                                            }
                                            menusByCategory[menu.category].push(menu);
                                        });

                                        // Category names mapping
                                        const categoryNames = {
                                            special: "เมนูพิเศษ",
                                            appetizer: "ออเดิร์ฟ",
                                            soup: "ซุป",
                                            maincourse: "จานหลัก",
                                            carb: "ข้าว/เส้น",
                                            curry: "ต้ม/แกง",
                                            dessert: "ของหวาน"
                                        };

                                        // Determine max selections based on package price
                                        const maxSelections = isSpecialRange ? 11 : 10;

                                        // Define the order of categories
                                        const orderedCategories = ['appetizer', 'soup', 'maincourse', 'carb', 'curry', 'dessert', 'special'];

                                        return orderedCategories
                                          .filter(category => menusByCategory[category] && menusByCategory[category].length > 0)
                                          .map(category => {
                                            const categoryMenus = menusByCategory[category];
                                            // Count how many items from this category are currently selected
                                            const selectedCount = selectedMenuSets.filter(selected =>
                                                categoryMenus.some(menu => menu.name === selected.menu_name)
                                            ).length;

                                            // Special category has limit of 1, others have limit of 2
                                            const categoryLimit = category === 'special' ? 1 : 2;

                                            return (
                                                <div key={category} className="mb-6">
                                                    <h4 className="font-semibold text-green-700 mb-3 border-b pb-1">
                                                        {categoryNames[category] || category}
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            (เลือกได้ {selectedCount}/{categoryLimit} อย่าง)
                                                        </span>
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2 border rounded">
                                                        {categoryMenus.map(menu => {
                                                            const isSelected = selectedMenuSets.some(selected => selected.menu_name === menu.name);
                                                            // Check if this category has reached its limit
                                                            const isCategoryLimitReached = selectedCount >= categoryLimit && !isSelected;

                                                            // Check if this menu is part of the selected package
                                                            const isPackageMenu = packageMenus.some(pkgMenu => {
                                                                // Handle both object and string IDs
                                                                const pkgMenuId = typeof pkgMenu === 'object' ? pkgMenu._id : pkgMenu;
                                                                return pkgMenuId === menu._id;
                                                            });

                                                            return (
                                                                <div
                                                                    key={menu._id}
                                                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                                        isSelected
                                                                            ? 'bg-green-100 border-green-500'
                                                                            : isPackageMenu
                                                                                ? 'bg-blue-100 border-blue-500' // Highlight package menus
                                                                                : isCategoryLimitReached || selectedMenuSets.length >= maxSelections
                                                                                    ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                                                                                    : 'bg-white hover:bg-gray-50 border-gray-200'
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (!isSelected && selectedMenuSets.length < maxSelections && !isCategoryLimitReached) {
                                                                            addToSelectedMenu(menu);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h4 className="font-medium text-gray-800">{menu.name}</h4>
                                                                            <p className="text-sm text-gray-600">{menu.description}</p>
                                                                            <span className="text-xs text-gray-500">{categoryNames[menu.category] || menu.category}</span>
                                                                        </div>
                                                                        {isPackageMenu && (
                                                                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                                                แพ็คเกจ
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                        <div>
                            <label className="label text-green-700 font-medium">เลือกตำแหน่งที่อยู่จัดงาน</label>
                            <div className="w-full">
                                <MapPicker
                                    initialAddress={bookingData.location.address}
                                    initialLat={bookingData.location.latitude}
                                    initialLng={bookingData.location.longitude}
                                    onLocationSelect={(locationData) => {
                                        setBookingData(prev => ({
                                            ...prev,
                                            location: {
                                                address: locationData.address,
                                                latitude: locationData.latitude,
                                                longitude: locationData.longitude
                                            }
                                        }));
                                    }}
                                />
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="label text-green-700 font-medium">หมายเหตุเพิ่มเติม</label>
                            <textarea
                                name="notes"
                                value={bookingData.notes}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="กรุณากรอกรายละเอียดเพิ่มเติม"
                                className="textarea textarea-bordered w-full bg-white border-green-200"
                            ></textarea>
                        </div>

                        {/* Price Summary */}
                        {bookingData.package.package_name && bookingData.table_count && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-700 mb-2">สรุปรายการ</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600">ชื่อแพ็กเกจ:</p>
                                        <p className="font-medium">{bookingData.package.package_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">จำนวนโต๊ะ:</p>
                                        <p className="font-medium">{formatNumber(bookingData.table_count)} โต๊ะ</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">ราคาต่อโต๊ะ:</p>
                                        <p className="font-medium">
                                            {formatPrice(bookingData.package.price_per_table)} บาท
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">ราคารวม:</p>
                                        <p className="font-medium text-green-700 font-bold">
                                            {formatPrice(calculateTotalPrice())} บาท
                                        </p>
                                    </div>
                                    {selectedMenuSets.length > 8 && (
                                        <div className="col-span-2 mt-2">
                                            <p className="text-sm text-gray-600">
                                                * ประกอบด้วยเมนูเพิ่มเติม {formatNumber(selectedMenuSets.length - 8)} อย่าง
                                                @ 200 บาท/อย่าง/โต๊ะ = {formatPrice((selectedMenuSets.length - 8) * 200 * bookingData.table_count)} บาท
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Terms and Conditions */}
                        <div className="flex items-center mt-6">
                            <input
                                type="checkbox"
                                id="agreement"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="checkbox checkbox-green"
                            />
                            <label htmlFor="agreement" className="label-text ml-2 text-gray-600">
                                ฉันยอมรับ <a href="#" className="text-green-600 underline">เงื่อนไขและข้อตกลง</a> ทั้งหมด
                            </label>
                        </div>

                        {agreed && bookingData.location.latitude && bookingData.location.longitude ? (
                            <div>
                                <button
                                    type="submit"
                                    className="btn bg-green-600 text-white hover:bg-green-700 w-full mt-6 py-4 text-lg"
                                >
                                    ยืนยันการจอง
                                </button>
                            </div>
                        ) : (
                            <div className="opacity-50 cursor-not-allowed">
                                <button
                                    type="button"
                                    className="btn bg-green-600 text-white w-full mt-6 py-4 text-lg"
                                    disabled
                                >
                                    ยืนยันการจอง
                                </button>
                                <p className="text-center text-red-500 mt-2 font-medium">
                                    {(!agreed && !bookingData.location.latitude && !bookingData.location.longitude)
                                        ? 'กรุณาตกลงเงื่อนไขและเลือกตำแหน่งที่อยู่จัดงาน'
                                        : !agreed
                                            ? 'กรุณาตกลงเงื่อนไขและข้อตกลง'
                                            : (!bookingData.location.latitude || !bookingData.location.longitude)
                                                ? 'กรุณาเลือกตำแหน่งที่อยู่จัดงานบนแผนที่'
                                                : 'กรุณาตกลงเงื่อนไขและข้อตกลงก่อนยืนยันการจอง'}
                                </p>
                            </div>
                        )}
                    </form>
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
    );
};

export default CustomerBooking;