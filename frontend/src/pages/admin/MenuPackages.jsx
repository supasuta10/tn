import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Utensils, X, Save, Minus, PlusCircle } from 'lucide-react';
import menuPackageService from '../../services/MenuPackageService';
import menuService from '../../services/MenuService';
import Swal from 'sweetalert2';
import { formatPriceWithCurrency, convertDecimalValue } from '../../utils/priceUtils';

const MenuPackages = () => {
  const [menuPackages, setMenuPackages] = useState([]);
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    maxSelect: 8,
    extraMenuPrice: 200,
    menus: [],
    description: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Load menu packages and menus from API
  useEffect(() => {
    loadMenuPackages();
    loadMenus();
  }, []);

  const loadMenuPackages = async () => {
    try {
      setLoading(true);
      const response = await menuPackageService.getAllMenuPackages();
      setMenuPackages(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load menu packages');
      console.error('Error loading menu packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      const response = await menuService.getAllMenus();
      setMenus(response.data.data || []);
    } catch (err) {
      console.error('Error loading menus:', err);
    }
  };

  // Function to group menus by category
  const groupMenusByCategory = (menus) => {
    const grouped = {};

    // Define category display names in Thai
    const categoryNames = {
      'appetizer': 'ออเดิร์ฟ',
      'soup': 'ซุป',
      'maincourse': 'จานหลัก',
      'carb': 'ข้าว/เส้น',
      'curry': 'ต้ม/แกง',
      'dessert': 'ของหวาน'
    };

    // Initialize all categories in the required order
    const orderedCategories = ['appetizer', 'soup', 'maincourse', 'carb', 'curry', 'dessert'];
    orderedCategories.forEach(category => {
      const categoryName = categoryNames[category];
      grouped[categoryName] = [];
    });

    // Group menus by category
    menus.forEach(menu => {
      const category = menu.category || 'other';
      const categoryName = categoryNames[category] || category;

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(menu);
    });

    // Return categories in the specified order
    const result = [];
    orderedCategories.forEach(category => {
      const categoryName = categoryNames[category];
      if (grouped[categoryName] && grouped[categoryName].length > 0) {
        result.push([categoryName, grouped[categoryName]]);
      }
    });

    // Add any other categories that weren't in the predefined list
    Object.entries(grouped).forEach(([categoryName, categoryMenus]) => {
      if (!orderedCategories.some(cat => categoryNames[cat] === categoryName) && categoryMenus.length > 0) {
        result.push([categoryName, categoryMenus]);
      }
    });

    return result;
  };


  // Open modal for creating new package
  const openCreateModal = () => {
    setCurrentPackage(null);
    setFormData({
      name: '',
      price: '',
      maxSelect: 8,
      extraMenuPrice: 200,
      menus: [],
      description: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for editing existing package
  const openEditModal = (pkg) => {
    setCurrentPackage(pkg);
    setFormData({
      name: pkg.name || '',
      price: convertDecimalValue(pkg.price) || '',
      maxSelect: pkg.maxSelect || 8,
      extraMenuPrice: convertDecimalValue(pkg.extraMenuPrice) || 200,
      menus: pkg.menus.map(menu => typeof menu === 'object' ? menu._id : menu) || [],
      description: pkg.description || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'maxSelect' || name === 'extraMenuPrice' ?
        (name === 'price' ? parseFloat(value) || 0 : parseInt(value) || 0) : value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle menu selection
  const handleMenuSelect = (menuId) => {
    setFormData(prev => {
      const isSelected = prev.menus.includes(menuId);

      // If menu is already selected, remove it
      if (isSelected) {
        const newMenus = prev.menus.filter(id => id !== menuId);
        return { ...prev, menus: newMenus };
      }
      // If menu is not selected, check if we've reached the max selection limit
      else if (prev.menus.length >= prev.maxSelect) {
        // Show warning if trying to select more than allowed
        Swal.fire({
          icon: 'warning',
          title: 'เลือกเมนูได้ถึงจำนวนสูงสุดแล้ว',
          text: `คุณสามารถเลือกได้สูงสุด ${prev.maxSelect} เมนูเท่านั้น`,
          confirmButtonColor: '#f59e0b'
        });
        return prev; // Don't add the menu
      }
      // Otherwise, add the menu
      else {
        const newMenus = [...prev.menus, menuId];
        return { ...prev, menus: newMenus };
      }
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Package name is required';
    }

    if (!formData.price) {
      errors.price = 'Package price is required';
    } else if (formData.price <= 0) {
      errors.price = 'Package price must be greater than 0';
    }

    if (!formData.maxSelect || formData.maxSelect <= 0) {
      errors.maxSelect = 'Max selection count must be greater than 0';
    }

    if (!formData.extraMenuPrice || formData.extraMenuPrice < 0) {
      errors.extraMenuPrice = 'Extra menu price cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (currentPackage) {
        // Update existing package
        await menuPackageService.updateMenuPackage(currentPackage._id, formData);
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตเรียบร้อยแล้ว!',
          text: `ชุด "${currentPackage.name}" ได้รับการอัปเดตเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      } else {
        // Create new package
        await menuPackageService.createMenuPackage(formData);
        Swal.fire({
          icon: 'success',
          title: 'เพิ่มเรียบร้อยแล้ว!',
          text: `ชุด ได้ถูกเพิ่มเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      }

      // Refresh packages
      await loadMenuPackages();
      setShowModal(false);

      // Reset form
      setFormData({
        name: '',
        price: '',
        maxSelect: 8,
        extraMenuPrice: 200,
        menus: [],
        description: ''
      });
    } catch (err) {
      if (err.response?.data?.message) {
        setFormErrors({ general: err.response.data.message });
      } else {
        setFormErrors({ general: 'Failed to save menu package' });
      }
      console.error('Error saving menu package:', err);
      Swal.fire({
        icon: 'error',
        title: 'การบันทึกล้มเหลว',
        text: err.response?.data?.message || 'ไม่สามารถบันทึกชุดได้ กรุณาลองอีกครั้ง',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Delete menu package with SweetAlert confirmation
  const deleteMenuPackage = async (pkg) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณกำลังจะลบชุด "${pkg.name}". การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'กำลังลบ...',
          text: 'กรุณารอสักครู่ในขณะที่เรากำลังลบชุด',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await menuPackageService.deleteMenuPackage(pkg._id);
        await loadMenuPackages();

        Swal.fire({
          icon: 'success',
          title: 'ลบเรียบร้อยแล้ว!',
          text: `ชุด "${pkg.name}" ได้ถูกลบเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      } catch (err) {
        console.error('Error deleting menu package:', err);
        Swal.fire({
          icon: 'error',
          title: 'การลบล้มเหลว',
          text: err.response?.data?.message || 'ไม่สามารถลบชุดได้ กรุณาลองอีกครั้ง',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ชุดอาหาร</h1>
          <p className="text-gray-600">จัดการชุดอาหารสำหรับลูกค้า</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มชุดใหม่
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จำนวนชุดทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{menuPackages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Utensils className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ราคาเฉลี่ย</p>
              <p className="text-2xl font-semibold text-gray-900">
                ฿{menuPackages.length > 0 ? Math.round(menuPackages.reduce((sum, pkg) => sum + convertDecimalValue(pkg.price), 0) / menuPackages.length) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จำนวนรายการเฉลี่ย</p>
              <p className="text-2xl font-semibold text-gray-900">
                {menuPackages.length > 0 ? Math.round(menuPackages.reduce((sum, pkg) => sum + (pkg.menus?.length || 0), 0) / menuPackages.length) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จำนวนเลือกสูงสุด</p>
              <p className="text-2xl font-semibold text-gray-900">
                {menuPackages.length > 0 ? Math.round(menuPackages.reduce((sum, pkg) => sum + pkg.maxSelect, 0) / menuPackages.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหาชุดตามชื่อหรือราคา..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Menu Packages Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">ชุดอาหาร</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อชุด</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">เลือกสูงสุด</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาเพิ่มเติม</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเมนู</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(menuPackages) && menuPackages
                .filter(pkg =>
                  pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  convertDecimalValue(pkg.price).toString().includes(searchTerm) ||
                  pkg.maxSelect.toString().includes(searchTerm) ||
                  convertDecimalValue(pkg.extraMenuPrice).toString().includes(searchTerm)
                )
                .map((pkg) => (
                <tr key={pkg._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPriceWithCurrency(pkg.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.maxSelect}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPriceWithCurrency(pkg.extraMenuPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.menus?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1 hover:bg-gray-100 rounded text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMenuPackage(pkg)}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Array.isArray(menuPackages) && menuPackages.filter(pkg =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          convertDecimalValue(pkg.price).toString().includes(searchTerm) ||
          pkg.maxSelect.toString().includes(searchTerm) ||
          convertDecimalValue(pkg.extraMenuPrice).toString().includes(searchTerm)
        ).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบชุดที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentPackage ? 'แก้ไขชุดอาหาร' : 'สร้างชุดอาหารใหม่'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formErrors.general && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{formErrors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อชุด *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="ชื่อชุด"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ราคา *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="ราคา"
                        min="0"
                      />
                      {formErrors.price && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        จำนวนเลือกสูงสุด
                      </label>
                      <input
                        type="number"
                        name="maxSelect"
                        value={formData.maxSelect}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.maxSelect ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="จำนวนเลือกสูงสุดที่ลูกค้าสามารถเลือกได้"
                        min="1"
                      />
                      {formErrors.maxSelect && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.maxSelect}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ราคาเมนูเพิ่มเติม
                      </label>
                      <input
                        type="number"
                        name="extraMenuPrice"
                        value={formData.extraMenuPrice}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.extraMenuPrice ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="ราคาต่อหนึ่งเมนูเพิ่มเติม"
                        min="0"
                      />
                      {formErrors.extraMenuPrice && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.extraMenuPrice}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำอธิบาย
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="คำอธิบาย"
                      rows="3"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        เมนูที่รวมอยู่
                      </label>
                      <span className="text-sm text-gray-600">
                        เลือกแล้ว: {formData.menus.length}/{formData.maxSelect}
                      </span>
                    </div>
                    <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                      {menus.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          ไม่มีรายการเมนู
                        </div>
                      ) : (
                        <div className="p-2">
                          {/* Group menus by category */}
                          {groupMenusByCategory(menus).map(([category, categoryMenus]) => (
                            <div key={category} className="mb-3">
                              <h5 className="font-semibold text-gray-800 mb-2 capitalize">{category}</h5>
                              <div className="space-y-1">
                                {categoryMenus.map(menu => (
                                  <div
                                    key={menu._id}
                                    className={`flex items-center p-2 rounded cursor-pointer ${
                                      formData.menus.includes(menu._id)
                                        ? 'bg-blue-100 border border-blue-300'
                                        : 'hover:bg-gray-50 border border-gray-200'
                                    } ${formData.menus.length >= formData.maxSelect && !formData.menus.includes(menu._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => handleMenuSelect(menu._id)}
                                  >
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={formData.menus.includes(menu._id)}
                                        readOnly
                                        className="mr-2"
                                      />
                                      <span className="text-sm">{menu.code} {menu.name}</span>
                                    </div>
                                      <span className="ml-auto text-xs text-gray-500">{formatPriceWithCurrency(menu.packagePrice)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">คลิกที่รายการเมนูเพื่อเลือกสำหรับนี้</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {currentPackage ? 'อัปเดต' : 'สร้าง'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPackages;