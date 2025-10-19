'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';

interface Admin {
  adminId: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
}

interface UpdateAdminProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
  onSuccess?: () => void;
}

const UpdateAdmin = ({ isOpen, onClose, admin, onSuccess }: UpdateAdminProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);

  useEffect(() => {
    if (isOpen && admin) {
      setIsVisible(true);
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        isActive: admin.isActive
      });
      setUpdatePassword(false);
      setErrors({});
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, admin]);

  if (!isVisible || !admin) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let processedValue: any = value;
    
    // Handle different input types
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'isActive') {
      // Convert string to boolean for isActive
      processedValue = value === 'true';
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Vui lòng nhập email hợp lệ';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (updatePassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !admin) return;

    setLoading(true);
    
    try {
      // Prepare update data - only include fields that have values
      const updateData: any = {};
      
      if (formData.name !== admin.name) {
        updateData.name = formData.name;
      }
      
      if (formData.email !== admin.email) {
        updateData.email = formData.email;
      }
      
      if (formData.phone !== (admin.phone || '')) {
        updateData.phone = formData.phone;
      }
      
      if (updatePassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Only include isActive if it's different from current value
      if (formData.isActive !== admin.isActive) {
        updateData.isActive = formData.isActive;
      }

      // Call API to update admin
      await adminService.updateAdmin(admin.adminId, updateData);
      
      // Show success message
      alert('Cập nhật thông tin quản trị viên thành công!');
      
      // Reset form and close modal
      setFormData({ name: '', email: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '', isActive: true });
      setErrors({});
      setUpdatePassword(false);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      // Show specific error message
      const errorMessage = error.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '', isActive: true });
    setErrors({});
    setUpdatePassword(false);
    onClose();
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
      <div className={`relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-auto p-6 transition-all duration-300 ease-out transform ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Cập nhật thông tin quản trị viên
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

        {/* Admin Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="h-12 w-12 flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
                {admin.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-4">
              <div className="text-lg font-medium text-gray-900">{admin.name}</div>
              <div className="text-sm text-gray-600">{admin.email}</div>
              <div className="text-xs text-gray-500">Vai trò: {admin.role}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên quản trị viên"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="isActive"
              name="isActive"
              value={formData.isActive ? 'true' : 'false'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Vô hiệu hóa</option>
            </select>
          </div>

          {/* Password Update Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="updatePassword"
              checked={updatePassword}
              onChange={(e) => setUpdatePassword(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="updatePassword" className="text-sm font-medium text-gray-700">
              Cập nhật mật khẩu
            </label>
          </div>

          {/* Password Fields - Only show when updatePassword is true */}
          {updatePassword && (
            <>
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại *
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu mới"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

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
                'Cập nhật'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdmin;
