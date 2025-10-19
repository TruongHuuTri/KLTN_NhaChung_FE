'use client';

import React from 'react';

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

interface FeedbackDetailProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback | null;
}

const FeedbackDetail = ({ isOpen, onClose, feedback }: FeedbackDetailProps) => {
  if (!isOpen || !feedback) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Chi tiết phản hồi
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Feedback Status and Type */}
          <div className="flex items-center space-x-2 mb-6">
            {getTypeBadge(feedback.type)}
            {getStatusBadge(feedback.status)}
            {getPriorityBadge(feedback.priority)}
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                <span className="text-lg font-medium text-gray-600">
                  {feedback.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{feedback.user.name}</p>
                <p className="text-sm text-gray-500">Gửi lúc {formatDate(feedback.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tiêu đề</h4>
              <p className="text-lg font-semibold text-gray-900">{feedback.title}</p>
            </div>

            {/* Content */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Nội dung</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{feedback.content}</p>
            </div>

            {/* Replies */}
            {feedback.replies && feedback.replies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Phản hồi từ admin</h4>
                <div className="space-y-4">
                  {feedback.replies.map((reply) => (
                    <div key={reply.id} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {reply.admin.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reply.admin.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(reply.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail;
