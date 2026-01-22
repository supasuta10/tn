import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import menuService from '../../services/MenuService';
import menuPackageService from '../../services/MenuPackageService';
import { formatPriceWithCurrency, convertDecimalValue } from '../../utils/priceUtils';

const Menu = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState([]);
  const [menuPackages, setMenuPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Load menu items and menu packages from API
  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const [menuResponse, packageResponse] = await Promise.all([
        menuService.getAllMenus(),
        menuPackageService.getAllMenuPackages()
      ]);
      // console.log(packageResponse.data.data)
      setMenuItems(menuResponse.data.data || []);
      setMenuPackages(packageResponse.data.data || []);
      setError(null);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลเมนูได้ กรุณาลองอีกครั้ง');
      console.error('Error loading menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (packageId) => {
    // Navigate to booking page with the selected package
    navigate('/booking', { state: { selectedPackage: packageId } });
  };

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleCloseModal = () => {
    setSelectedPackage(null);
  };

  // Get unique categories from menu items
  const categories = ['appetizer', 'soup', 'maincourse', 'carb', 'curry', 'dessert'];
  const categoryNames = {
    appetizer: "ออเดิร์ฟ",
    soup: "ซุป",
    maincourse: "จานหลัก",
    carb: "ข้าว/เส้น",
    curry: "ต้ม/แกง",
    dessert: "ของหวาน"
  };

  const filteredMenu = activeCategory === 'all'
    ? menuItems.filter(item => item.active) // Only show active menu items
    : menuItems.filter(item => item.category === activeCategory && item.active);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-8">เมนูอาหารโต๊ะจีน</h1>

        {/* Menu Items Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-6">รายการอาหาร</h2>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              className={`px-4 py-2 rounded-full ${activeCategory === 'all' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
              onClick={() => setActiveCategory('all')}
            >
              ทั้งหมด
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full ${activeCategory === category ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                onClick={() => setActiveCategory(category)}
              >
                {categoryNames[category]}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {filteredMenu.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <div key={item._id} className="bg-white p-6 rounded-xl shadow-md border border-green-100">
                  {item.image ? (
                    <img
                      src={`http://localhost:8080${item.image}`}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-xl mb-4"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 mb-4" />
                  )}
                  <h3 className="font-bold text-green-800 text-xl mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <button className="btn btn-sm bg-green-600 text-white hover:bg-green-700">
                      จองโต๊ะ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ไม่พบรายการอาหารในหมวดนี้
            </div>
          )}
        </section>

        {/* Menu Packages Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-6">ชุดอาหารโต๊ะจีน</h2>

          {menuPackages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuPackages.map((pkg) => (
                <div key={pkg._id} className="bg-white p-6 rounded-xl shadow-md border border-green-100">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 mb-4 flex items-center justify-center">
                    <span className="text-gray-500">Package Image</span>
                  </div>
                  <h3 className="font-bold text-green-800 text-xl mb-2">{pkg.name}</h3>
                  <div className="text-lg font-bold text-green-600 mb-2">{formatPriceWithCurrency(pkg.price)}</div>
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">เลือกได้:</span> {pkg.maxSelect} อย่าง
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">ราคาเพิ่มเติม:</span> ฿{convertDecimalValue(pkg.extraMenuPrice)}/อย่าง
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-medium">เมนูในชุด:</span>
                    </p>
                    <div className="max-h-24 overflow-y-auto">
                      {pkg.menus && pkg.menus.length > 0 ? (
                        <ul className="text-sm text-gray-600">
                          {(pkg.menus || []).slice(0, 3).map((menu, idx) => (
                            <li key={idx} className="truncate">• {typeof menu === 'object' ? menu.name : menu}</li>
                          ))}
                          {pkg.menus.length > 3 && (
                            <li>... และอีก {pkg.menus.length - 3} เมนู</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">ไม่มีเมนูในชุด</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <button
                      className="btn bg-green-600 text-white hover:bg-green-700 flex-1"
                      onClick={() => handlePackageSelect(pkg._id)}
                    >
                      จองชุดนี้
                    </button>
                    <button
                      className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 flex-1"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ไม่พบชุดอาหารโต๊ะจีน
            </div>
          )}
        </section>

        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h2 className="text-2xl font-bold text-green-700 mb-4">สอบถามเพิ่มเติม</h2>
          <p className="text-gray-600 mb-4">
            หากท่านมีคำถามเพิ่มเติมเกี่ยวกับเมนูอาหารโต๊ะจีน หรือต้องการสอบถามรายละเอียดเพิ่มเติม
            สามารถติดต่อเราผ่านช่องทางต่างๆ ด้านล่างนี้
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="btn bg-green-600 text-white hover:bg-green-700">
              ติดต่อผ่าน LINE
            </button>
            <button className="btn btn-outline text-green-600 border-green-600 hover:bg-green-50">
              ส่งข้อความ
            </button>
          </div>
        </div>
      </div>

      {/* Modal for showing package details */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 break-words">{selectedPackage.name}</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4">
                <p className="text-base sm:text-lg font-bold text-green-600 mb-2">
                  {formatPriceWithCurrency(selectedPackage.price)}
                </p>

                <div className="mb-4">
                  <p className="text-sm sm:text-base text-gray-600">
                    <span className="font-medium">เลือกได้:</span> {selectedPackage.maxSelect} อย่าง
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    <span className="font-medium">ราคาเพิ่มเติม:</span> ฿{convertDecimalValue(selectedPackage.extraMenuPrice)}/อย่าง
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-2">รายละเอียดเมนูในชุด:</p>
                  {selectedPackage.menus && selectedPackage.menus.length > 0 ? (
                    <ul className="space-y-1 max-h-60 overflow-y-auto text-sm">
                      {selectedPackage.menus.map((menu, idx) => (
                        <li key={idx} className="py-1 border-b border-gray-100 break-words">
                          • {typeof menu === 'object' ? menu.name : menu}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">ไม่มีเมนูในชุด</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  className="btn bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    handlePackageSelect(selectedPackage._id);
                    handleCloseModal();
                  }}
                >
                  จองชุดนี้
                </button>
                <button
                  className="btn btn-outline text-green-600 border-green-600 hover:bg-green-50"
                  onClick={handleCloseModal}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu