'use client';

import React, { useState } from 'react';
import FeedbackDetail from '@/components/modals/FeedbackDetail';
import ReplyFeedback from '@/components/modals/ReplyFeedback';

interface Feedback {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  title: string;
  content: string;
  type: 'bug' | 'feature' | 'complaint' | 'suggestion';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  replies?: {
    id: number;
    admin: {
      name: string;
      avatar: string;
    };
    content: string;
    createdAt: string;
  }[];
}

const Feedback = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Mock data - replace with actual API call
  const feedbacks: Feedback[] = [
    {
      id: 1,
      user: {
        name: 'Nguyễn Văn A',
        avatar: '/avatars/user1.jpg'
      },
      title: 'Lỗi không thể đăng nhập',
      content: 'Tôi không thể đăng nhập vào tài khoản của mình. Hệ thống báo lỗi "Invalid credentials" mặc dù tôi đã nhập đúng thông tin.',
      type: 'bug',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      user: {
        name: 'Trần Thị B',
        avatar: '/avatars/user2.jpg'
      },
      title: 'Đề xuất thêm tính năng tìm kiếm nâng cao',
      content: 'Tôi muốn đề xuất thêm tính năng tìm kiếm theo giá thuê, diện tích, và khoảng cách từ trường học.',
      type: 'feature',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      replies: [
        {
          id: 1,
          admin: {
            name: 'Admin System',
            avatar: '/avatars/admin.jpg'
          },
          content: 'Cảm ơn bạn đã góp ý. Chúng tôi đang xem xét và sẽ triển khai tính năng này trong phiên bản tiếp theo.',
          createdAt: '2024-01-14T16:45:00Z'
        }
      ]
    },
    {
      id: 3,
      user: {
        name: 'Lê Văn C',
        avatar: '/avatars/user3.jpg'
      },
      title: 'Phàn nàn về chất lượng dịch vụ',
      content: 'Tôi đã gặp vấn đề với việc thanh toán. Giao dịch bị treo nhưng tiền vẫn bị trừ. Cần được hỗ trợ ngay lập tức.',
      type: 'complaint',
      status: 'resolved',
      priority: 'urgent',
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T11:30:00Z',
      replies: [
        {
          id: 2,
          admin: {
            name: 'Admin System',
            avatar: '/avatars/admin.jpg'
          },
          content: 'Chúng tôi đã xử lý vấn đề của bạn. Số tiền đã được hoàn lại vào tài khoản. Xin lỗi vì sự bất tiện này.',
          createdAt: '2024-01-13T11:30:00Z'
        }
      ]
    }
  ];

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedFeedback(null);
    setIsDetailModalOpen(false);
  };

  const handleReplyFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setSelectedFeedback(null);
    setIsReplyModalOpen(false);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
      in_progress: { color: 'bg-blue-100 text-blue-800', text: 'Đang xử lý' },
      resolved: { color: 'bg-green-100 text-green-800', text: 'Đã giải quyết' },
      closed: { color: 'bg-gray-100 text-gray-800', text: 'Đã đóng' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      bug: { color: 'bg-red-100 text-red-800', text: 'Lỗi', icon: '🐛' },
      feature: { color: 'bg-blue-100 text-blue-800', text: 'Tính năng', icon: '✨' },
      complaint: { color: 'bg-orange-100 text-orange-800', text: 'Khiếu nại', icon: '😠' },
      suggestion: { color: 'bg-green-100 text-green-800', text: 'Góp ý', icon: '💡' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { color: 'bg-gray-100 text-gray-800', text: type, icon: '📝' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Thấp' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Trung bình' },
      high: { color: 'bg-orange-100 text-orange-800', text: 'Cao' },
      urgent: { color: 'bg-red-100 text-red-800', text: 'Khẩn cấp' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { color: 'bg-gray-100 text-gray-800', text: priority };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.text}
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
              <h1 className="text-2xl font-bold text-gray-900">Quản lý phản hồi</h1>
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
                    placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc người gửi..."
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
                    <option value="pending">Chờ xử lý</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="block w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="bug">Lỗi</option>
                    <option value="feature">Tính năng</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="suggestion">Góp ý</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Feedbacks List */}
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {feedback.user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                          {getTypeBadge(feedback.type)}
                          {getStatusBadge(feedback.status)}
                          {getPriorityBadge(feedback.priority)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {feedback.user.name} • {formatDate(feedback.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {feedback.content}
                    </p>

                    {feedback.replies && feedback.replies.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Phản hồi từ admin ({feedback.replies.length})
                        </p>
                        <div className="space-y-2">
                          {feedback.replies.map((reply) => (
                            <div key={reply.id} className="text-sm text-gray-600">
                              <div className="flex items-center mb-1">
                                <span className="font-medium">{reply.admin.name}</span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-gray-500">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p>{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleViewFeedback(feedback)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                    {feedback.status !== 'closed' && (
                      <button
                        onClick={() => handleReplyFeedback(feedback)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Phản hồi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredFeedbacks.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có phản hồi nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Không tìm thấy phản hồi nào phù hợp với tìm kiếm của bạn.' : 'Chưa có phản hồi nào được gửi.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Detail Modal */}
      <FeedbackDetail
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        feedback={selectedFeedback}
      />

      {/* Reply Feedback Modal */}
      <ReplyFeedback
        isOpen={isReplyModalOpen}
        onClose={handleCloseReplyModal}
        feedback={selectedFeedback}
      />
    </div>
  );
};

export default Feedback;
