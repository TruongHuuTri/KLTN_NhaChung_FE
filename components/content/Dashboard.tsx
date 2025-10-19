'use client';

import React from 'react';

const Dashboard = () => {
  const features = [
    {
      icon: '👥',
      title: 'Quản lý người dùng',
      description: 'Theo dõi hoạt động người dùng, thêm, xóa, sửa, cập lại mật khẩu của người dùng không tự thao tác được.'
    },
    {
      icon: '👨‍💼',
      title: 'Quản lý quản trị viên',
      description: 'Quản lý tài khoản quản trị viên, phân quyền và theo dõi hoạt động của họ.'
    },
    {
      icon: '📄',
      title: 'Quản lý bài đăng',
      description: 'Kiểm duyệt, xóa, chỉnh sửa các bài đăng phòng trọ từ người dùng.'
    },
    {
      icon: '💬',
      title: 'Quản lý phản hồi',
      description: 'Xem và trả lời các phản hồi, góp ý từ người dùng về hệ thống.'
    },
    {
      icon: '📊',
      title: 'Thống kê và báo cáo',
      description: 'Theo dõi các chỉ số quan trọng như số lượng người dùng, bài đăng, doanh thu.'
    },
    {
      icon: '🔧',
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình các tham số hệ thống, quản lý cài đặt chung.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý và giám sát toàn bộ hoạt động của hệ thống nhà chung
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Chào mừng đến với hệ thống quản trị</h2>
              <p className="text-blue-100">
                Quản lý hiệu quả toàn bộ hoạt động của hệ thống nhà chung từ một giao diện duy nhất.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm font-semibold">👥</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-semibold">📄</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Bài đăng</p>
                    <p className="text-2xl font-bold text-gray-900">567</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-sm font-semibold">💬</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Phản hồi</p>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm font-semibold">📊</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Hoạt động</p>
                    <p className="text-2xl font-bold text-gray-900">2,345</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
