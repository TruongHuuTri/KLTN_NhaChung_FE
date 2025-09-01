'use client';

import { useState } from 'react';

interface AreaDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AreaDropdown({ isOpen, onClose }: AreaDropdownProps) {
  const [selectedProvince, setSelectedProvince] = useState('Tp Hồ Chí Minh');
  const [selectedDistrict, setSelectedDistrict] = useState('Thành phố Thủ Đức');
  const [selectedWard, setSelectedWard] = useState('');

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 z-50">
      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-xl p-5 w-80 shadow-2xl border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Khu vực</h3>
        
        <div className="space-y-4">
          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn tỉnh thành <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-sm transition-all duration-200"
              >
                <option value="Tp Hồ Chí Minh">Tp Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn quận huyện <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-sm transition-all duration-200"
              >
                <option value="Thành phố Thủ Đức">Thành phố Thủ Đức</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 2">Quận 2</option>
                <option value="Quận 3">Quận 3</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn phường xã <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-sm transition-all duration-200"
              >
                <option value="">Chọn phường xã</option>
                <option value="Phường Linh Trung">Phường Linh Trung</option>
                <option value="Phường Linh Xuân">Phường Linh Xuân</option>
                <option value="Phường Hiệp Bình Chánh">Phường Hiệp Bình Chánh</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <button 
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
