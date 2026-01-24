import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Utensils, X, Save } from 'lucide-react';
import menuService from '../../services/MenuService';
import menuPackageService from '../../services/MenuPackageService';
import Swal from 'sweetalert2';
import { formatPriceWithCurrency } from '../../utils/priceUtils';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [availablePackages, setAvailablePackages] = useState([]);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'appetizer',
    // packages: [], // Removed as per request
    image: '',
    tags: []
  });
  const [imageFile, setImageFile] = useState(null);

  const [formErrors, setFormErrors] = useState({});

  // Sample categories based on backend schema
  const categories = ['appetizer', 'special', 'maincourse', 'carb', 'soup', 'curry', 'dessert'];

  // Load menu items from API
  useEffect(() => {
    loadMenuItems();
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await menuPackageService.getAllMenuPackages();
      setAvailablePackages(response.data.data || []);
    } catch (err) {
      console.error("Error loading packages:", err);
    }
  };

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuService.getAllMenus();
      // console.log(response.data.data)
      setMenuItems(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items');
      console.error('Error loading menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search and filters
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Available' ? item.active : !item.active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (active) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (active) => {
    return active ? 'Available' : 'Not Available';
  };

  // Open modal for creating new item
  const openCreateModal = () => {
    setCurrentItem(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      category: 'appetizer',
      // packages: [],
      price: 0,
      image: '',
      tags: []
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for editing existing item
  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'appetizer',
      // packages: item.packages ? item.packages.map(p => (typeof p === 'object' ? p._id : p)) : [],
      image: item.image || '',
      tags: item.tags || []
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.code.trim()) {
      errors.code = 'Code is required';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
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
      let response;
      if (currentItem) {
        // Update existing item
        if (imageFile) {
          // Create form data for image upload
          const updateFormData = new FormData();
          updateFormData.append('code', formData.code);
          updateFormData.append('name', formData.name);
          updateFormData.append('description', formData.description);
          updateFormData.append('category', formData.category);
          updateFormData.append('packages', JSON.stringify(formData.packages));
          updateFormData.append('image', imageFile);
          updateFormData.append('tags', JSON.stringify(formData.tags));

          response = await menuService.updateMenuWithImage(currentItem._id, updateFormData);
        } else {
          // Update without image
          response = await menuService.updateMenu(currentItem._id, formData);
        }

        Swal.fire({
          icon: 'success',
          title: 'อัปเดตเรียบร้อยแล้ว!',
          text: `เมนู "${currentItem.name}" ได้รับการอัปเดตเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      } else {
        // Create new item
        if (imageFile) {
          // Create form data for image upload
          const createFormData = new FormData();
          createFormData.append('code', formData.code);
          createFormData.append('name', formData.name);
          createFormData.append('description', formData.description);
          createFormData.append('category', formData.category);
          createFormData.append('packages', JSON.stringify(formData.packages));
          createFormData.append('image', imageFile);
          createFormData.append('tags', JSON.stringify(formData.tags));

          response = await menuService.createMenuWithImage(createFormData);
        } else {
          // Create without image
          response = await menuService.createMenu(formData);
        }

        Swal.fire({
          icon: 'success',
          title: 'เพิ่มเรียบร้อยแล้ว!',
          text: `เมนู "${formData.name}" ได้ถูกเพิ่มเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      }

      // Refresh items
      await loadMenuItems();
      setShowModal(false);

      // Reset form
      setFormData({
        code: '',
        name: '',
        description: '',
        category: 'appetizer',
        packages: [],
        image: '',
        tags: []
      });
      setImageFile(null);
    } catch (err) {
      if (err.response?.data?.message) {
        setFormErrors({ general: err.response.data.message });
      } else {
        setFormErrors({ general: 'Failed to save menu item' });
      }
      console.error('Error saving menu item:', err);
      Swal.fire({
        icon: 'error',
        title: 'การบันทึกล้มเหลว',
        text: err.response?.data?.message || 'ไม่สามารถบันทึกเมนูได้ กรุณาลองอีกครั้ง',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Toggle menu item availability
  const toggleAvailability = async (item) => {
    try {
      await menuService.toggleActive(item._id);
      await loadMenuItems();
    } catch (err) {
      setError('Failed to update menu item availability');
      console.error('Error toggling availability:', err);
      Swal.fire({
        icon: 'error',
        title: 'การอัปเดตล้มเหลว',
        text: 'ไม่สามารถอัปเดตสถานะเมนูได้ กรุณาลองอีกครั้ง',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Delete menu item with SweetAlert confirmation
  const deleteMenuItem = async (item) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณกำลังจะลบ "${item.name}". การกระทำนี้ไม่สามารถย้อนกลับได้`,
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
          text: 'กรุณารอสักครู่ในขณะที่เรากำลังลบเมนู',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await menuService.deleteMenu(item._id);
        await loadMenuItems();

        Swal.fire({
          icon: 'success',
          title: 'ลบเรียบร้อยแล้ว!',
          text: `เมนู "${item.name}" ได้ถูกลบเรียบร้อยแล้ว`,
          confirmButtonColor: '#22c55e'
        });
      } catch (err) {
        console.error('Error deleting menu item:', err);
        Swal.fire({
          icon: 'error',
          title: 'การลบล้มเหลว',
          text: err.response?.data?.message || 'ไม่สามารถลบเมนูได้ กรุณาลองอีกครั้ง',
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
          <h1 className="text-2xl font-bold text-gray-900">การจัดการเมนู</h1>
          <p className="text-gray-600">จัดการรายการเมนูและหมวดหมู่สำหรับบริการจัดเลี้ยง</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มรายการใหม่
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Utensils className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จำนวนรายการทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{menuItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">หมวดหมู่</p>
              <p className="text-2xl font-semibold text-gray-900">{new Set(menuItems.map(item => item.category)).size}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Utensils className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ใช้งานอยู่</p>
              <p className="text-2xl font-semibold text-gray-900">{menuItems.filter(item => item.active).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <Utensils className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ไม่ใช้งาน</p>
              <p className="text-2xl font-semibold text-gray-900">{menuItems.filter(item => !item.active).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหารายการเมนูตามชื่อหรือรหัส..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">ทุกหมวดหมู่</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'appetizer' ? 'ของกินเล่น' :
                  cat === 'maincourse' ? 'อาหารจานหลัก' :
                    cat === 'carb' ? 'ข้าว/เส้น' :
                      cat === 'soup' ? 'ซุป' :
                        cat === 'curry' ? 'ต้ม/แกง' :
                          cat === 'dessert' ? 'ของหวาน' :
                            cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">ทุกสถานะ</option>
            <option value="Available">ใช้งานอยู่</option>
            <option value="Not Available">ไม่ใช้งาน</option>
          </select>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">รายการเมนู</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">รายการ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Packages</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMenuItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image ? (
                        <img
                          src={`http://localhost:8080${item.image}`}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.category === 'appetizer' ? 'ของกินเล่น' :
                      item.category === 'maincourse' ? 'อาหารจานหลัก' :
                        item.category === 'carb' ? 'ข้าว/เส้น' :
                          item.category === 'soup' ? 'ซุป' :
                            item.category === 'curry' ? 'ต้ม/แกง' :
                              item.category === 'dessert' ? 'ของหวาน' :
                                item.category}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.packages && item.packages.length > 0 ? (
                        item.packages.map((pkg, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {typeof pkg === 'object' ? pkg.name : 'Unknown Package'}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.active)}`}>
                      {getStatusText(item.active)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 hover:bg-gray-100 rounded text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* <button
                        onClick={() => toggleAvailability(item)}
                        className={`p-1 hover:bg-gray-100 rounded ${
                          item.active ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {item.active ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button> */}
                      <button
                        onClick={() => deleteMenuItem(item)}
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

        {filteredMenuItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบรายการเมนูที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentItem ? 'แก้ไขรายการเมนู' : 'สร้างรายการเมนูใหม่'}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รหัส *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.code ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="ป้อนรหัสรายการ"
                    />
                    {formErrors.code && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="ป้อนชื่อรายการเมนู"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
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
                      placeholder="ป้อนคำอธิบาย"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หมวดหมู่
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'appetizer' ? 'ของกินเล่น' :
                            category === 'maincourse' ? 'อาหารจานหลัก' :
                              category === 'carb' ? 'ข้าว/เส้น' :
                                category === 'soup' ? 'ซุป' :
                                  category === 'curry' ? 'ต้ม/แกง' :
                                    category === 'dessert' ? 'ของหวาน' :
                                      category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Package selection removed as per request */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รูปภาพเมนู
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setImageFile(e.target.files[0]);
                        // Clear the existing image URL if a file is selected
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {imageFile && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">เลือกไฟล์: {imageFile.name}</p>
                        <div className="mt-2 flex items-center">
                          <img
                            src={URL.createObjectURL(imageFile)}
                            alt="ตัวอย่างรูปภาพ"
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        </div>
                      </div>
                    )}
                    {!imageFile && formData.image && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">รูปภาพปัจจุบัน:</p>
                        <div className="mt-2">
                          <img
                            src={`http://localhost:8080${formData.image}`}
                            alt="ตัวอย่างรูปภาพ"
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      แท็ก (คั่นด้วยเครื่องหมายจุลภาค)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={handleTagsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เช่น ยอดนิยม, อาหารเผ็ด, อาหารเจ"
                    />
                    <p className="mt-1 text-xs text-gray-500">คั่นแท็กด้วยเครื่องหมายจุลภาค</p>
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
                    {currentItem ? 'อัปเดต' : 'สร้าง'}
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

export default MenuManagement;