'use client';

import React, { useState } from 'react';

interface Activity {
  id: number;
  admin: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  details: string;
  timestamp: string;
  type: 'user' | 'post' | 'feedback' | 'system';
}

const Activity = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data - replace with actual API call
  const activities: Activity[] = [
    {
      id: 1,
      admin: {
        name: 'Admin System',
        avatar: '/avatars/admin.jpg'
      },
      action: 'Đã tạo',
      target: 'quản trị viên mới',
      details: 'Tạo tài khoản quản trị viên cho Nguyễn Văn A',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'user'
    },
    {
      id: 2,
      admin: {
        name: 'Minh Quang',
        avatar: '/avatars/minhquang.jpg'
      },
      action: 'Đã duyệt',
      target: 'bài đăng',
      details: 'Duyệt bài đăng "Phòng trọ đẹp gần trường Đại học"',
      timestamp: '2024-01-15T09:15:00Z',
      type: 'post'
    },
    {
      id: 3,
      admin: {
        name: 'Admin System',
        avatar: '/avatars/admin.jpg'
      },
      action: 'Đã phản hồi',
      target: 'phản hồi',
      details: 'Trả lời phản hồi "Lỗi không thể đăng nhập"',
      timestamp: '2024-01-15T08:45:00Z',
      type: 'feedback'
    },
    {
      id: 4,
      admin: {
        name: 'Minh Quang',
        avatar: '/avatars/minhquang.jpg'
      },
      action: 'Đã vô hiệu hóa',
      target: 'người dùng',
      details: 'Vô hiệu hóa tài khoản người dùng Trần Thị B',
      timestamp: '2024-01-14T16:20:00Z',
      type: 'user'
    },
    {
      id: 5,
      admin: {
        name: 'Admin System',
        avatar: '/avatars/admin.jpg'
      },
      action: 'Đã từ chối',
      target: 'bài đăng',
      details: 'Từ chối bài đăng "Nhà trọ có sân vườn" - Nội dung không phù hợp',
      timestamp: '2024-01-14T14:30:00Z',
      type: 'post'
    },
    {
      id: 6,
      admin: {
        name: 'Minh Quang',
        avatar: '/avatars/minhquang.jpg'
      },
      action: 'Đã cập nhật',
      target: 'cài đặt hệ thống',
      details: 'Thay đổi cài đặt thời gian tự động xóa bài đăng cũ',
      timestamp: '2024-01-14T11:15:00Z',
      type: 'system'
    },
    {
      id: 7,
      admin: {
        name: 'Admin System',
        avatar: '/avatars/admin.jpg'
      },
      action: 'Đã giải quyết',
      target: 'phản hồi',
      details: 'Giải quyết phản hồi "Phàn nàn về chất lượng dịch vụ"',
      timestamp: '2024-01-13T15:45:00Z',
      type: 'feedback'
    },
    {
      id: 8,
      admin: {
        name: 'Minh Quang',
        avatar: '/avatars/minhquang.jpg'
      },
      action: 'Đã kích hoạt',
      target: 'người dùng',
      details: 'Kích hoạt lại tài khoản người dùng Lê Văn C',
      timestamp: '2024-01-13T10:20:00Z',
      type: 'user'
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    
    // Simple date filtering - in real app, you'd implement proper date range filtering
    const matchesDate = dateFilter === 'all' || true; // Placeholder for date filtering
    
    return matchesType && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      user: '👤',
      post: '📄',
      feedback: '💬',
      system: '⚙️'
    };
    return typeIcons[type as keyof typeof typeIcons] || '📝';
  };

  const getTypeColor = (type: string) => {
    const typeColors = {
      user: 'bg-blue-100 text-blue-800',
      post: 'bg-green-100 text-green-800',
      feedback: 'bg-yellow-100 text-yellow-800',
      system: 'bg-purple-100 text-purple-800'
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (action: string) => {
    if (action.includes('tạo') || action.includes('kích hoạt') || action.includes('duyệt')) {
      return 'text-green-600';
    } else if (action.includes('xóa') || action.includes('vô hiệu hóa') || action.includes('từ chối')) {
      return 'text-red-600';
    } else if (action.includes('cập nhật') || action.includes('phản hồi') || action.includes('giải quyết')) {
      return 'text-blue-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch sử hoạt động</h1>
              <p className="text-sm text-gray-600 mt-1">
                Theo dõi tất cả hoạt động của quản trị viên trong hệ thống
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Type Filter */}
              <div className="flex-shrink-0">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <option value="all">Tất cả loại hoạt động</option>
                  <option value="user">Quản lý người dùng</option>
                  <option value="post">Quản lý bài đăng</option>
                  <option value="feedback">Quản lý phản hồi</option>
                  <option value="system">Hệ thống</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex-shrink-0">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start">
                    {/* Timeline line */}
                    {index < filteredActivities.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-4 relative z-10">
                      <span className="text-sm">{getTypeIcon(activity.type)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(activity.type)}`}>
                            {activity.type === 'user' && 'Người dùng'}
                            {activity.type === 'post' && 'Bài đăng'}
                            {activity.type === 'feedback' && 'Phản hồi'}
                            {activity.type === 'system' && 'Hệ thống'}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {activity.admin.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.admin.name}</span>
                            <span className={`mx-1 ${getActionColor(activity.action)}`}>
                              {activity.action}
                            </span>
                            <span className="text-gray-600">{activity.target}</span>
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{activity.details}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có hoạt động nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chưa có hoạt động nào được ghi nhận trong khoảng thời gian này.
              </p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">👤</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Hoạt động người dùng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activities.filter(a => a.type === 'user').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm font-semibold">📄</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Hoạt động bài đăng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activities.filter(a => a.type === 'post').length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">Hoạt động phản hồi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activities.filter(a => a.type === 'feedback').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-semibold">⚙️</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Hoạt động hệ thống</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activities.filter(a => a.type === 'system').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
