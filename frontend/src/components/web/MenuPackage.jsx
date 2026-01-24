import React, { useEffect, useState } from 'react'
import menuPackageService from '../../services/MenuPackageService';
import { useNavigate } from 'react-router';
import { convertDecimalValue, formatPriceWithCurrency } from '../../utils/priceUtils';

const MenuPackage = () => {
  const [menuPackages, setMenuPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  const loadMenuData = async () => {
    try {
      setLoading(true);

      const response = await menuPackageService.getAllMenuPackages(); // ← ใส่ await
      setMenuPackages(response.data.data || []);
      setError(null);

    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลเมนูได้ กรุณาลองอีกครั้ง');
      console.error('Error loading menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (packageId) => {
    navigate('/booking', { state: { selectedPackage: packageId } });
  };

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleCloseModal = () => {
    setSelectedPackage(null);
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-8">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">ชุดอาหารโต๊ะจีน</h2>

        {menuPackages.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {menuPackages.map((pkg) => {
              // Calculate total selectable items from categories
              const maxSelect = pkg.categories ? pkg.categories.reduce((sum, c) => sum + (c.quota || 0), 0) : 0;
              // Collect all menu items for display
              const allMenuItems = pkg.categories ? pkg.categories.flatMap(c => c.items || []) : [];
              // Default extra price
              const extraMenuPrice = pkg.categories && pkg.categories.length > 0 ? (pkg.categories[0].extraPrice || 200) : 200;

              return (
                <div key={pkg._id} className="bg-white p-6 rounded-xl shadow-md border border-green-100">
                  {pkg.image ? (
                    <img
                      src={`http://localhost:8080${pkg.image}`}
                      alt={pkg.name}
                      className="w-full h-40 object-cover rounded-xl mb-4"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Package Image</span>
                    </div>
                  )}

                  <h3 className="font-bold text-green-800 text-xl mb-2">{pkg.name}</h3>
                  <div className="text-lg font-bold text-green-600 mb-2">
                    {formatPriceWithCurrency(pkg.price)}
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">เลือกได้:</span> {maxSelect} อย่าง
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">ราคาเพิ่มเติม:</span> ฿{extraMenuPrice}/อย่าง
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-medium">เมนูในชุด:</span>
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {allMenuItems.length > 0 ? (
                        <ul className="text-sm text-gray-600">
                          {allMenuItems.map((item, idx) => (
                            <li key={idx} className="truncate">
                              • {item.menu && typeof item.menu === 'object' ? item.menu.name : 'Loading...'}
                            </li>
                          ))}
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
              );
            })}

          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            ไม่พบชุดอาหารโต๊ะจีน
          </div>
        )}
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
                    <span className="font-medium">เลือกได้:</span> {selectedPackage.categories ? selectedPackage.categories.reduce((sum, c) => sum + (c.quota || 0), 0) : 0} อย่าง
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    <span className="font-medium">ราคาเพิ่มเติม:</span> ฿{selectedPackage.categories && selectedPackage.categories.length > 0 ? (selectedPackage.categories[0].extraPrice || 200) : 200}/อย่าง
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-2">รายละเอียดเมนูในชุด:</p>
                  {selectedPackage.categories && selectedPackage.categories.length > 0 ? (
                    <ul className="space-y-1 max-h-60 overflow-y-auto text-sm">
                      {selectedPackage.categories.flatMap(c => c.items || []).map((item, idx) => (
                        <li key={idx} className="py-1 border-b border-gray-100 break-words">
                          • {item.menu && typeof item.menu === 'object' ? item.menu.name : 'Loading...'}
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
    </section>
  );
}

export default MenuPackage;
