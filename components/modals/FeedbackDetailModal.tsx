'use client';

import React, { useState, useEffect } from 'react';

interface Feedback {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  title: string;
  content: string;
  status: 'Đã phản hồi' | 'Chưa phản hồi';
}

interface FeedbackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback | null;
  onOpenReplyModal?: (feedback: Feedback) => void;
}

const FeedbackDetailModal = ({ isOpen, onClose, feedback, onOpenReplyModal }: FeedbackDetailModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible || !feedback) return null;

  const handleClose = () => {
    onClose();
  };

  const handleReply = () => {
    if (feedback && onOpenReplyModal) {
      onOpenReplyModal(feedback);
    }
  };

  // Mock full content for demo
  const fullContent = `${feedback.content}

Chi tiết phản hồi đầy đủ:

📞 Thông tin liên hệ:
- Email: ${feedback.user.name.toLowerCase().replace(' ', '.')}@example.com
- Thời gian gửi: ${feedback.createdAt}

📋 Nội dung chi tiết:
Tôi gặp vấn đề khi sử dụng ứng dụng. Cụ thể là:

1. Không thể đăng nhập vào tài khoản
2. Quên mật khẩu nhưng không nhận được email reset
3. Giao diện bị lỗi trên điện thoại

Mong admin hỗ trợ sớm. Cảm ơn!

🔍 Trạng thái: ${feedback.status}
⏰ Thời gian phản hồi dự kiến: 24-48h`;

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
      <div className={`relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-auto p-6 transition-all duration-300 ease-out transform max-h-[90vh] overflow-y-auto ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Phản hồi của user {feedback.user.name}
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

        {/* User Info Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                  {feedback.user.avatar}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-lg font-medium text-gray-900">{feedback.user.name}</div>
                <div className="text-sm text-gray-600">{feedback.createdAt}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                feedback.status === 'Đã phản hồi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {feedback.status}
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={feedback.title}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              value={fullContent}
              readOnly
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 resize-none"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            {feedback.status === 'Chưa phản hồi' && onOpenReplyModal && (
              <button
                onClick={handleReply}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
              >
                Phản hồi lại user
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailModal;
