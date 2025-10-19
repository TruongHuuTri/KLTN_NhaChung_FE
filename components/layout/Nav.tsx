'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  FaHome, 
  FaUsers, 
  FaUser, 
  FaFileAlt, 
  FaComments, 
  FaChartBar,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaIdCard
} from 'react-icons/fa';

const Nav = () => {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    {
      icon: FaHome,
      label: 'Thống kê',
      href: '/'
    },
    {
      icon: FaUsers,
      label: 'Quản trị viên',
      href: '/admins'
    },
    {
      icon: FaUser,
      label: 'Người dùng',
      href: '/users'
    },
    {
      icon: FaIdCard,
      label: 'Xác thực',
      href: '/verifications'
    },
    {
      icon: FaFileAlt,
      label: 'Bài đăng',
      href: '/posts'
    },
    {
      icon: FaComments,
      label: 'Phản hồi',
      href: '/feedback'
    },
    {
      icon: FaChartBar,
      label: 'Lịch sử hoạt động',
      href: '/activity'
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-amber-600 to-amber-700 text-white min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 text-center border-b border-amber-500/30">
        <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
          <FaHome className="text-2xl text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Hệ thống Nhà Chung</h1>
        <p className="text-sm text-amber-100 mt-1">
          Quản lý phòng trọ hiệu quả
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-amber-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <IconComponent className="mr-3 text-lg" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-amber-500/30">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors"
          onClick={handleLogoutClick}
        >
          <div>
            <div className="text-sm font-medium text-white">
              {admin?.name || 'Đang tải...'}
            </div>
            <div className="text-xs text-amber-100">
              {admin?.email || 'Đang tải...'}
            </div>
          </div>
          <FaSignOutAlt className="w-5 h-5 text-amber-100 hover:text-white transition-colors" />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelLogout}></div>
          <div className="relative bg-white rounded-lg shadow-lg max-w-sm w-full mx-auto p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận đăng xuất</h3>
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nav;
