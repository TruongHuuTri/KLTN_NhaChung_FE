'use client';

import React, { useState, useEffect } from 'react';
import UpdateAdmin from '@/components/modals/admin/UpdateAdmin';
import CreateAdmin from '@/components/modals/admin/CreateAdmin';
import { adminService } from '@/services/adminService';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Admin {
  adminId: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

const Admin = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load admins from API
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set token for adminService
        if (currentAdmin) {
          const token = adminService.getToken();
                    if (token) {
                      const data = await adminService.getAllAdmins() as Admin[];
                      setAdmins(data);
                    }
        }
      } catch (err: any) {
        console.error('Error loading admins:', err);
        setError(err.message || 'Không thể tải danh sách quản trị viên');
      } finally {
        setLoading(false);
      }
    };

    loadAdmins();
  }, [currentAdmin]);

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && admin.isActive) ||
      (statusFilter === 'inactive' && !admin.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setSelectedAdmin(null);
    setIsUpdateModalOpen(false);
  };

  const handleUpdateSuccess = () => {
    // Reload admins after successful update
    const loadAdmins = async () => {
      try {
        const token = adminService.getToken();
        if (token) {
          const data = await adminService.getAllAdmins() as Admin[];
          setAdmins(data);
        }
      } catch (err: any) {
        console.error('Error reloading admins:', err);
      }
    };
    loadAdmins();
  };

  const handleCreateAdmin = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSuccess = () => {
    // Reload admins after successful create
    const loadAdmins = async () => {
      try {
        const token = adminService.getToken();
        if (token) {
          const data = await adminService.getAllAdmins() as Admin[];
          setAdmins(data);
        }
      } catch (err: any) {
        console.error('Error reloading admins:', err);
      }
    };
    loadAdmins();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Hoạt động
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Vô hiệu hóa
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý quản trị viên</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Vô hiệu hóa</option>
                  </select>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex-shrink-0">
                <button 
                  onClick={handleCreateAdmin}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tạo quản trị viên
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải danh sách quản trị viên...</span>
            </div>
          )}

          {/* Admins Table */}
          {!loading && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên quản trị viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lần đăng nhập cuối
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => (
                      <tr key={admin.adminId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                {admin.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                                {admin.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {admin.role}
                          </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(admin.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {admin.lastLogin ? formatDate(admin.lastLogin) : 'Chưa đăng nhập'}
                          </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                              onClick={() => handleUpdateAdmin(admin)}
                          className="text-blue-600 hover:text-blue-900"
                              title="Cập nhật thông tin"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'Không tìm thấy quản trị viên nào phù hợp' : 'Chưa có quản trị viên nào'}
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Support Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-colors">
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Hỗ trợ</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>

      {/* Update Admin Modal */}
      <UpdateAdmin 
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        admin={selectedAdmin}
        onSuccess={handleUpdateSuccess}
      />

      {/* Create Admin Modal */}
      <CreateAdmin
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Admin;
