'use client';

import React from 'react';

const DashboardContent = () => {
  const features = [
    {
      icon: '👥',
      title: 'Quản lý người dùng',
      description: 'Theo dõi hoạt động người dùng, thêm, xóa, sửa, cập lại mật khẩu của người dùng không tự thao tác được.'
    },
    {
      icon: '📄',
      title: 'Quản lý bài đăng',
      description: 'Xem xét, duyệt bài đăng của người dùng, xem được lịch sử ngày đăng và nội dung của bài đăng.'
    },
    {
      icon: '💬',
      title: 'Quản lý phản hồi',
      description: 'Nhận phản hồi của người dùng về phàn nàn và cho người dùng trong thời gian có định.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trang chủ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V5a2 2 0 012-2h8a2 2 0 012 2v6.05"
                  />
                </svg>
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Chào mừng đến với hệ thống quản lý phòng trọ
            </h2>
            <p className="text-lg text-gray-600">
              Tính năng chính:
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default DashboardContent;
