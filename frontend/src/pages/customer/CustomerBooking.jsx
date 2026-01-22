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
                        type="button"
                        onClick={() => {
                            // Reset to current month and select today's date
                            const currentDate = new Date();
                            setViewYear(currentDate.getFullYear());
                            setViewMonth(currentDate.getMonth());
                            onDateSelect(currentDate); // Select today's date
                        }}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                        title="กลับไปเดือนปัจจุบันและเลือกวันนี้"
                    >
                        ปัจจุบัน
                    </button>
                    <button
                        type="button"
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
                        type="button"
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
        event_time: '',
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

            if (selectedPackage && selectedPackage.categories && selectedPackage.categories.length > 0) {
                const defaultItems = [];

                selectedPackage.categories.forEach(cat => {
                    if (cat.items && cat.items.length > 0) {
                        cat.items.forEach(item => {
                            if (item.isDefault) {
                                // Find actual menu
                                const menuId = typeof item.menu === 'object' ? item.menu._id : item.menu;
                                const menuObj = allMenus.find(m => m._id === menuId);

                                if (menuObj) {
                                    defaultItems.push({
                                        menu_name: menuObj.name,
                                        category: menuObj.category, // Use menu's real category or the package category? Package category is stricter.
                                        quantity: 1
                                    });
                                }
                            }
                        });
                    }
                });

                setSelectedMenuSets(defaultItems);
            } else if (selectedPackage && selectedPackage.menus) {
                // Fallback for legacy
                const packageMenuItems = selectedPackage.menus.map(menuId => {
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

            // Set package menus/selections
            // Determine if using new Categories or old Menus
            if (selectedPackage.categories && selectedPackage.categories.length > 0) {
                // New Logic
                setPackageMenus([]); // Not used in new logic much, but maybe clear it

                if (autoSelectPackageMenus) {
                    const defaultItems = [];
                    selectedPackage.categories.forEach(cat => {
                        if (cat.items) {
                            cat.items.forEach(item => {
                                if (item.isDefault) {
                                    const menuId = typeof item.menu === 'object' ? item.menu._id : item.menu;
                                    const menuObj = allMenus.find(m => m._id === menuId);
                                    if (menuObj) {
                                        defaultItems.push({
                                            menu_name: menuObj.name,
                                            category: menuObj.category,
                                            quantity: 1
                                        });
                                    }
                                }
                            });
                        }
                    });
                    setSelectedMenuSets(defaultItems);
                } else {
                    setSelectedMenuSets([]);
                }
            } else if (selectedPackage.menus && selectedPackage.menus.length > 0) {
                // Legacy Logic
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

        const isSelected = selectedMenuSets.some(m => m.menu_name === menu.name);

        if (isSelected) {
            // New Requirement: Click again to remove
            setSelectedMenuSets(prev => prev.filter(m => m.menu_name !== menu.name));
        } else {
            // Add menu if not selected (Always allow adding, we charge extra if over quota)
            setSelectedMenuSets(prev => [...prev, {
                menu_name: menu.name,
                category: menu.category,
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

        // Verify package conditions
        const pkg = menuPackages.find(p => p._id === bookingData.package.packageID);
        let additionalCost = 0;

        if (pkg && pkg.categories && pkg.categories.length > 0 && selectedMenuSets.length > 0) {
            // New Logic: Check against category Quota
            const categoryCounts = {};

            selectedMenuSets.forEach(item => {
                let cat = item.category;
                if (!cat && allMenus.length > 0) {
                    const found = allMenus.find(m => m.name === item.menu_name);
                    if (found) cat = found.category;
                }
                cat = cat || 'unknown';
                if (!categoryCounts[cat]) categoryCounts[cat] = 0;
                categoryCounts[cat] += 1;
            });

            pkg.categories.forEach(cat => {
                const count = categoryCounts[cat.name] || 0;

                if (count > cat.quota) {
                    const extra = count - cat.quota;
                    // Use configured extraPrice or default to 200 if not set (legacy/default)
                    const price = (cat.extraPrice !== undefined) ? cat.extraPrice : 200;
                    additionalCost += extra * price * bookingData.table_count;
                }
            });
        }
        else if (pkg && pkg.conditions && pkg.conditions.length > 0 && selectedMenuSets.length > 0) {
            // Legacy Logic
            // ... (Same as before)
            const categoryCounts = {};
            selectedMenuSets.forEach(item => {
                let cat = item.category;
                if (!cat && allMenus.length > 0) {
                    const found = allMenus.find(m => m.name === item.menu_name);
                    if (found) cat = found.category;
                }
                cat = cat || 'unknown';

                if (!categoryCounts[cat]) categoryCounts[cat] = 0;
                categoryCounts[cat] += 1;
            });

            pkg.conditions.forEach(cond => {
                const count = categoryCounts[cond.category] || 0;
                if (count > cond.quota) {
                    const extra = count - cond.quota;
                    const price = typeof cond.extraPrice === 'object' ? parseFloat(cond.extraPrice.$numberDecimal) : parseFloat(cond.extraPrice);
                    additionalCost += extra * price * bookingData.table_count;
                }
            });
        }
        // Fallback for packages without conditions (legacy support)
        else if (selectedMenuSets.length > 8) {
            // ...
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

        // Validate menu selection based on quotas
        const currentPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);

        let isValid = true;
        let errorMsg = "";

        if (showMenuSelection && !autoSelectPackageMenus && currentPackage) {
            if (currentPackage.categories && currentPackage.categories.length > 0) {
                // Validate against Categories Quota (Min Requirement)
                const categoryCounts = {};
                selectedMenuSets.forEach(item => {
                    let cat = item.category;
                    if (!cat && allMenus.length > 0) {
                        const found = allMenus.find(m => m.name === item.menu_name);
                        if (found) cat = found.category;
                    }
                    cat = cat || 'unknown';
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                });

                currentPackage.categories.forEach(cat => {
                    const count = categoryCounts[cat.name] || 0;
                    if (count < cat.quota) {
                        if (cat.quota > 0) {
                            isValid = false;
                            const catNames = {
                                'appetizer': 'ออเดิร์ฟ',
                                'special': 'เมนูพิเศษ',
                                'soup': 'ซุป',
                                'maincourse': 'จานหลัก',
                                'carb': 'ข้าว/เส้น',
                                'curry': 'ต้ม/แกง',
                                'dessert': 'ของหวาน'
                            };
                            const catName = catNames[cat.name] || cat.name;
                            errorMsg = `กรุณาเลือก ${catName} ให้ครบอย่างน้อย ${cat.quota} รายการ (เลือกแล้ว ${count})`;
                        }
                    }
                    // Removal of strict Max Quota check to allow extra selections
                });

            } else if (currentPackage.conditions) {
                // Legacy validation
                const categoryCounts = {};
                selectedMenuSets.forEach(item => {
                    let cat = item.category;
                    if (!cat && allMenus.length > 0) {
                        const found = allMenus.find(m => m.name === item.menu_name);
                        if (found) cat = found.category;
                    }
                    cat = cat || 'unknown';
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                });

                currentPackage.conditions.forEach(cond => {
                    const count = categoryCounts[cond.category] || 0;
                    if (count < cond.quota) {
                        if (cond.quota > 0) {
                            isValid = false;
                            const catNames = {
                                'appetizer': 'ออเดิร์ฟ',
                                'special': 'เมนูพิเศษ',
                                'soup': 'ซุป',
                                'maincourse': 'จานหลัก',
                                'carb': 'ข้าว/เส้น',
                                'curry': 'ต้ม/แกง',
                                'dessert': 'ของหวาน'
                            };
                            const catName = catNames[cond.category] || cond.category;
                            errorMsg = `กรุณาเลือก ${catName} ให้ครบอย่างน้อย ${cond.quota} รายการ (เลือกแล้ว ${count})`;
                        }
                    }
                });
            }
        }

        if (!isValid && showMenuSelection && !autoSelectPackageMenus) {
            Swal.fire({
                title: 'เลือกเมนูไม่ครบถ้วน!',
                text: errorMsg,
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
            // Combine date and time for event_datetime
            const eventDate = bookingData.event_datetime; // YYYY-MM-DD from calendar
            const eventTime = bookingData.event_time || '00:00'; // HH:mm from time input
            const combinedDateTime = new Date(`${eventDate}T${eventTime}:00`);

            // Prepare booking data for submission
            const bookingPayload = {
                customer: {
                    customerID: bookingData.customerID,
                    name: bookingData.customer.name,
                    phone: bookingData.customer.phone,
                    email: bookingData.customer.email
                },
                packageId: bookingData.package.packageID,
                event_datetime: combinedDateTime.toISOString(),
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
                                        // Convert date to date format (YYYY-MM-DD)
                                        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

                            {/* Display selected date */}
                            {bookingData.event_datetime && (
                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                                    <span className="text-green-700 font-medium">
                                        📅 วันที่เลือก: {new Date(bookingData.event_datetime).toLocaleDateString('th-TH', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Booking Details Section - Time and Table Count */}
                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="label text-green-700 font-medium">เวลาที่ต้องการจัด</label>
                                <select
                                    name="event_time"
                                    value={bookingData.event_time || ''}
                                    onChange={handleInputChange}
                                    className="select select-bordered w-full bg-white border-green-200"
                                    required
                                >
                                    <option value="" disabled>เลือกเวลา</option>
                                    <optgroup label="🌅 ช่วงเช้า (07:00-09:00 น.)">
                                        <option value="07:00">07:00 น.</option>
                                        <option value="07:30">07:30 น.</option>
                                        <option value="08:00">08:00 น.</option>
                                        <option value="08:30">08:30 น.</option>
                                        <option value="09:00">09:00 น.</option>
                                    </optgroup>
                                    <optgroup label="☀️ ช่วงเที่ยง (10:00-12:00 น.)">
                                        <option value="10:00">10:00 น.</option>
                                        <option value="10:30">10:30 น.</option>
                                        <option value="11:00">11:00 น.</option>
                                        <option value="11:30">11:30 น.</option>
                                        <option value="12:00">12:00 น.</option>
                                    </optgroup>
                                    <optgroup label="🌆 ช่วงเย็น (16:00-20:00 น.)">
                                        <option value="16:00">16:00 น.</option>
                                        <option value="16:30">16:30 น.</option>
                                        <option value="17:00">17:00 น.</option>
                                        <option value="17:30">17:30 น.</option>
                                        <option value="18:00">18:00 น.</option>
                                        <option value="18:30">18:30 น.</option>
                                        <option value="19:00">19:00 น.</option>
                                        <option value="19:30">19:30 น.</option>
                                        <option value="20:00">20:00 น.</option>
                                    </optgroup>
                                </select>
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

                            {/* Display auto-selected menus when checkbox is checked */}
                            {autoSelectPackageMenus && bookingData.package.packageID && selectedMenuSets.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold text-green-700 mb-3">🍽️ เมนูที่เลือกอัตโนมัติ ({selectedMenuSets.length} รายการ)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {selectedMenuSets.map((menu, index) => (
                                            <div
                                                key={index}
                                                className="bg-green-50 p-2 rounded-lg border border-green-200 text-center text-sm"
                                            >
                                                <span className="text-green-800">{menu.menu_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                        const maxSelections = (packagePrice >= 3000) ? 11 : 10;
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
                                            <p className="text-sm text-blue-800 mt-2">
                                                <strong>เงื่อนไข:</strong> เลือกตามโควต้าของแต่ละหมวดหมู่ หากเลือกเกินจะคิดราคาเพิ่ม
                                            </p>
                                        </div>

                                        {/* Legend for menu highlighting */}
                                        <div className="flex flex-wrap gap-4 mt-3">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-green-100 border border-green-500 rounded mr-2"></div>
                                                <span className="text-sm">เมนูที่เลือก (ในโควต้า)</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded mr-2"></div>
                                                <span className="text-sm">เมนูส่วนเกิน (มีค่าใช้จ่ายเพิ่ม)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="label text-green-700 font-medium">🍽️ เมนูที่เลือกแล้ว ({selectedMenuSets.length} อย่าง)</label>
                                        {selectedMenuSets.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {selectedMenuSets.map((menu, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-green-50 p-2 rounded-lg border border-green-200 text-center text-sm flex items-center justify-between"
                                                    >
                                                        <span className="text-green-800 flex-1">{menu.menu_name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSelectedMenu(index)}
                                                            className="ml-2 text-red-500 hover:text-red-700 font-bold"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-lg border text-center">
                                                <span className="text-gray-500 text-sm">ยังไม่ได้เลือกเมนู</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {/* Group menus by category */}
                                        {(() => {
                                            const currentPackage = menuPackages.find(pkg => pkg._id === bookingData.package.packageID);

                                            // Handle New Schema (Categories have items)
                                            if (currentPackage && currentPackage.categories && currentPackage.categories.length > 0) {
                                                return currentPackage.categories.map((category, index) => {
                                                    // Resolve menu items
                                                    const categoryMenuItems = category.items ? category.items.map(item => {
                                                        const menuId = typeof item.menu === 'object' ? item.menu._id : item.menu;
                                                        const menuObj = allMenus.find(m => m._id === menuId);
                                                        if (!menuObj) return null;
                                                        return { ...menuObj, isDefault: item.isDefault };
                                                    }).filter(m => m !== null) : [];

                                                    if (categoryMenuItems.length === 0) return null;

                                                    // Count selected in this category
                                                    const selectedCount = selectedMenuSets.filter(selected =>
                                                        categoryMenuItems.some(m => m.name === selected.menu_name)
                                                    ).length;

                                                    const quota = category.quota || 0;
                                                    const isOverQuota = selectedCount > quota;

                                                    const catNames = {
                                                        appetizer: "ออเดิร์ฟ",
                                                        soup: "ซุป",
                                                        maincourse: "จานหลัก",
                                                        carb: "ข้าว/เส้น",
                                                        curry: "ต้ม/แกง",
                                                        dessert: "ของหวาน"
                                                    };

                                                    return (
                                                        <div key={category.name || index} className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                                                <div>
                                                                    <h4 className="font-semibold text-green-800 text-lg capitalize">
                                                                        {catNames[category.name] || category.name}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-500">
                                                                        โควต้า: {quota} รายการ {isOverQuota && <span className="text-red-500">(เลือกเพิ่ม +{(category.extraPrice || 200)} บาท/รายการ)</span>}
                                                                    </p>
                                                                </div>
                                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${isOverQuota ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                                    เลือกแล้ว: {selectedCount}/{quota}
                                                                </div>
                                                            </div>

                                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                                                {categoryMenuItems.map(menu => {
                                                                    const isSelected = selectedMenuSets.some(selected => selected.menu_name === menu.name);

                                                                    return (
                                                                        <div
                                                                            key={menu._id}
                                                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                                                                                ? isOverQuota
                                                                                    ? 'bg-yellow-50 border-yellow-500'
                                                                                    : 'bg-green-50 border-green-500'
                                                                                : 'bg-white hover:bg-gray-50 border-gray-200'
                                                                                }`}
                                                                            onClick={() => {
                                                                                addToSelectedMenu(menu);
                                                                            }}
                                                                        >
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <h4 className="font-medium text-gray-800">
                                                                                        {menu.name}
                                                                                        {menu.isDefault && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">แนะนำ</span>}
                                                                                    </h4>
                                                                                    <p className="text-sm text-gray-600 line-clamp-1">{menu.description}</p>
                                                                                </div>
                                                                                {isSelected && isOverQuota}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            }

                                            // Fallback for Legacy Data
                                            const conditions = currentPackage.conditions || [];
                                            let poolMenus = allMenus;
                                            if (currentPackage.menus && currentPackage.menus.length > 0) {
                                                poolMenus = allMenus.filter(m =>
                                                    currentPackage.menus.some(pm =>
                                                        (typeof pm === 'object' ? pm._id : pm) === m._id
                                                    )
                                                );
                                            }

                                            // Group available menus by category
                                            const menusByCategory = {};
                                            poolMenus.forEach(menu => {
                                                if (!menusByCategory[menu.category]) {
                                                    menusByCategory[menu.category] = [];
                                                }
                                                menusByCategory[menu.category].push(menu);
                                            });

                                            // Category names mapping
                                            const categoryNames = {
                                                appetizer: "ออเดิร์ฟ",
                                                soup: "ซุป",
                                                maincourse: "จานหลัก",
                                                carb: "ข้าว/เส้น",
                                                curry: "ต้ม/แกง",
                                                dessert: "ของหวาน"
                                            };

                                            const orderedCategories = ['appetizer', 'soup', 'maincourse', 'carb', 'curry', 'dessert'];

                                            return orderedCategories.map(category => {
                                                // Find condition for this category
                                                const condition = conditions.find(c => c.category === category) || { quota: 0, extraPrice: 200 };
                                                const categoryMenus = menusByCategory[category] || [];

                                                if (categoryMenus.length === 0) return null;

                                                // Count selected in this category
                                                const selectedCount = selectedMenuSets.filter(selected =>
                                                    categoryMenus.some(menu => menu.name === selected.menu_name)
                                                ).length;

                                                const quota = condition.quota || 0;
                                                const extraPrice = condition.extraPrice || 0;
                                                const isOverQuota = selectedCount > quota;

                                                return (
                                                    <div key={category} className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                                            <div>
                                                                <h4 className="font-semibold text-green-800 text-lg">
                                                                    {categoryNames[category] || category}
                                                                </h4>
                                                                <p className="text-xs text-gray-500">
                                                                    โควต้า: {quota} จาน {extraPrice > 0 ? `(เพิ่มจานละ +${extraPrice} บาท)` : ''}
                                                                </p>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isOverQuota ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                                เลือกแล้ว: {selectedCount}/{quota}
                                                            </div>
                                                        </div>

                                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                                            {categoryMenus.map(menu => {
                                                                const isSelected = selectedMenuSets.some(selected => selected.menu_name === menu.name);
                                                                const isExtra = isSelected && selectedCount > quota;

                                                                return (
                                                                    <div
                                                                        key={menu._id}
                                                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                                                                            ? isOverQuota
                                                                                ? 'bg-yellow-50 border-yellow-500' // Warn about potential cost?
                                                                                : 'bg-green-50 border-green-500'
                                                                            : 'bg-white hover:bg-gray-50 border-gray-200'
                                                                            }`}
                                                                        onClick={() => {
                                                                            if (!isSelected) {
                                                                                addToSelectedMenu(menu);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <h4 className="font-medium text-gray-800">{menu.name}</h4>
                                                                                <p className="text-sm text-gray-600 line-clamp-1">{menu.description}</p>
                                                                            </div>
                                                                            {isSelected && isOverQuota}
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
                                    <div className="col-span-2 mt-2">
                                        <p className="text-sm text-gray-600">
                                            {(() => {
                                                const totalWithExtras = calculateTotalPrice();
                                                const basePrice = parseFloat(bookingData.package.price_per_table) * parseInt(bookingData.table_count);
                                                const extraCost = totalWithExtras - basePrice;
                                                return extraCost > 0
                                                    ? `* รวมค่าเมนูส่วนเกิน ${formatPrice(extraCost)} บาท`
                                                    : '* ไม่มีค่าใช้จ่ายเพิ่มเติม';
                                            })()}
                                        </p>
                                    </div>
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
                                className="checkbox border-green-600 checked:bg-green-600 checked:border-green-600 [--chkbg:theme(colors.green.600)] [--chkfg:white]"
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
                        <li>กรุณาจองล่วงหน้าอย่างน้อย 7 วัน ก่อนวันจัดงาน หากจองกระทันหันใกล้วันงาน ขออนุญาตยกเลิกทุกกรณี</li>
                        <li>กรณีเลื่อนวันจัดงาน ต้องแจ้งล่วงหน้าอย่างน้อย 3 วัน</li>
                        <li>กรณียกเลิกงาน ไม่คืนมัดจำให้ ยกเว้นกรณีพิเศษ เช่น งานขาวดำ</li>
                        <li>กรณีมีปริมาณการสั่งจำนวนโต๊ะน้อยกว่า 25 โต๊ะ ขออนุญาตเก็บค่าขนส่ง (1,000-3,000 บาท ขึ้นอยู่กับระยะทาง)</li>
                        <li>ขอความกรุณาชำระมัดจำภายใน 3 วันหลังจากยืนยันการจอง</li>
                        <li>ค่าบริการส่วนที่เหลือ ทางร้านขอเก็บเป็นเงินสดหลังจบงานเท่านั้น</li>
                        <li>ทางร้านขอสงวนสิทธิ์ในการเปลี่ยนแปลงเมนูอาหารตามวัตถุดิบที่มีในแต่ละฤดูกาล</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CustomerBooking;