'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';

const Sidebar = () => {
  const pathname = usePathname();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const menuItems = [
    {
      icon: '🏠',
      label: 'Trang chủ',
      href: '/'
    },
    {
      icon: '👥',
      label: 'Người dùng',
      href: '/users'
    },
    {
      icon: '📄',
      label: 'Bài đăng',
      href: '/posts'
    },
    {
      icon: '💬',
      label: 'Phản hồi',
      href: '/feedback'
    },
    {
      icon: '📊',
      label: 'Lịch sử hoạt động',
      href: '/activity'
    }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-amber-600 to-amber-700 text-white min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 text-center border-b border-amber-500/30">
        <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
          <div className="text-2xl">🏠</div>
        </div>
        <h1 className="text-xl font-bold text-white">Trust Stay</h1>
        <p className="text-sm text-amber-100 mt-1">
          Sự tin cậy đặt lên hàng đầu
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  pathname === item.href
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-amber-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-amber-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Minh Quang</div>
            <div className="text-xs text-amber-100">Admin@gmail.com</div>
          </div>
          <button 
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="text-amber-100 hover:text-white transition-colors"
            title="Đổi mật khẩu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;