'use client';

import React, { useState, useEffect } from 'react';
import { userService, AdminUser } from '@/services/userService';

interface UserActionProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSuccess?: () => void;
}

const UserAction = ({ isOpen, onClose, user, onSuccess }: UserActionProps) => {
  const [action, setAction] = useState<'activate' | 'deactivate' | 'reset_password'>('activate');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsVisible(true);
      // Set default action based on user status
      setAction(user.isActive ? 'deactivate' : 'activate');
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  if (!isVisible || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    
    try {
      if (action === 'activate' || action === 'deactivate') {
        // Update user status
        await userService.updateUserStatus(user.userId, action === 'activate');
        alert(`Đã ${action === 'activate' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng thành công!`);
      } else if (action === 'reset_password') {
        // Reset password using admin API
        const result = await userService.resetUserPasswordForAdmin(user.userId);
        alert(`Đặt lại mật khẩu thành công!\nMật khẩu mới: ${result.newPassword}\nMật khẩu đã được gửi qua email cho người dùng.`);
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAction('activate');
    onClose();
  };

  const getActionText = () => {
    switch (action) {
      case 'activate':
        return 'Kích hoạt người dùng';
      case 'deactivate':
        return 'Vô hiệu hóa người dùng';
      case 'reset_password':
        return 'Đặt lại mật khẩu';
      default:
        return 'Thao tác';
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'activate':
        return 'Kích hoạt tài khoản người dùng để họ có thể đăng nhập và sử dụng hệ thống.';
      case 'deactivate':
        return 'Vô hiệu hóa tài khoản người dùng. Họ sẽ không thể đăng nhập vào hệ thống.';
      case 'reset_password':
        return 'Đặt lại mật khẩu cho người dùng. Mật khẩu mới sẽ được tạo tự động và gửi qua email.';
      default:
        return '';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-lg max-w-md w-full mx-auto p-6 transition-all duration-300 ease-out transform ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Thao tác người dùng
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="h-12 w-12 flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-4">
              <div className="text-lg font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="text-xs text-gray-500">
                Trạng thái: {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn thao tác
            </label>
            <div className="space-y-3">
              {/* Activate Option */}
              {!user.isActive && (
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="action"
                    value="activate"
                    checked={action === 'activate'}
                    onChange={(e) => setAction(e.target.value as 'activate')}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Kích hoạt người dùng</div>
                    <div className="text-xs text-gray-500">Cho phép người dùng đăng nhập và sử dụng hệ thống</div>
                  </div>
                </label>
              )}

              {/* Deactivate Option */}
              {user.isActive && (
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="action"
                    value="deactivate"
                    checked={action === 'deactivate'}
                    onChange={(e) => setAction(e.target.value as 'deactivate')}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Vô hiệu hóa người dùng</div>
                    <div className="text-xs text-gray-500">Ngăn người dùng đăng nhập vào hệ thống</div>
                  </div>
                </label>
              )}

              {/* Reset Password Option */}
              <label className="flex items-start">
                <input
                  type="radio"
                  name="action"
                  value="reset_password"
                  checked={action === 'reset_password'}
                  onChange={(e) => setAction(e.target.value as 'reset_password')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Đặt lại mật khẩu</div>
                  <div className="text-xs text-gray-500">Tạo mật khẩu mới tự động và gửi qua email</div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Description */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Mô tả:</strong> {getActionDescription()}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : (
                getActionText()
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAction;
