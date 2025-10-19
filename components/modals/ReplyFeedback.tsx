'use client';

import React, { useState, useEffect } from 'react';

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
}

interface ReplyFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback | null;
  onSuccess?: () => void;
}

const ReplyFeedback = ({ isOpen, onClose, feedback, onSuccess }: ReplyFeedbackProps) => {
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && feedback) {
      setIsVisible(true);
      setReplyContent('');
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, feedback]);

  if (!isVisible || !feedback) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    setLoading(true);
    
    try {
      // Here you would call the API to send the reply
      // await feedbackService.replyFeedback(feedback.id, replyContent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Phản hồi đã được gửi thành công!');
      
      // Reset form and close modal
      setReplyContent('');
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
    setReplyContent('');
    onClose();
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      bug: '🐛',
      feature: '✨',
      complaint: '😠',
      suggestion: '💡'
    };
    return typeIcons[type as keyof typeof typeIcons] || '📝';
  };

  const getTypeText = (type: string) => {
    const typeTexts = {
      bug: 'Lỗi',
      feature: 'Tính năng',
      complaint: 'Khiếu nại',
      suggestion: 'Góp ý'
    };
    return typeTexts[type as keyof typeof typeTexts] || type;
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
            Phản hồi phản hồi
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

        {/* Feedback Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-gray-600">
                  {feedback.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{feedback.user.name}</p>
                <p className="text-xs text-gray-500">
                  {getTypeIcon(feedback.type)} {getTypeText(feedback.type)}
                </p>
              </div>
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{feedback.title}</h4>
          <p className="text-sm text-gray-700">{feedback.content}</p>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="replyContent" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung phản hồi *
            </label>
            <textarea
              id="replyContent"
              name="replyContent"
              rows={6}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập nội dung phản hồi..."
              required
            />
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
              disabled={loading || !replyContent.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi...
                </div>
              ) : (
                'Gửi phản hồi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyFeedback;
