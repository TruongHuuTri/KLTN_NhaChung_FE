'use client';

import React from 'react';
import { AdminPost } from '@/services/postService';
import { FaClock, FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaTag } from 'react-icons/fa';

interface PostDetailProps {
  isOpen: boolean;
  onClose: () => void;
  post: AdminPost | null;
  onStatusChange?: (postId: number, status: 'approve' | 'reject', reason?: string) => void;
  getUserDisplayName?: (userId: number) => string;
  getUserContactInfo?: (userId: number) => { email: string; phone: string };
}

const PostDetail = ({ isOpen, onClose, post, onStatusChange, getUserDisplayName, getUserContactInfo }: PostDetailProps) => {
  const [selectedAction, setSelectedAction] = React.useState<'approve' | 'reject' | ''>('');
  const [rejectReason, setRejectReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedAction('');
      setRejectReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

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
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt', icon: FaClock },
      active: { color: 'bg-green-100 text-green-800', text: 'Đã duyệt', icon: FaCheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Từ chối', icon: FaTimesCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: 'bg-gray-100 text-gray-800', 
      text: status, 
      icon: FaClock 
    };
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <IconComponent className="mr-1" />
        {config.text}
      </span>
    );
  };

  const handleSubmit = async () => {
    if (!selectedAction || (selectedAction === 'reject' && !rejectReason.trim())) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange?.(post.postId, selectedAction, selectedAction === 'reject' ? rejectReason : undefined);
      onClose();
    } catch (error) {
      console.error('Error updating post status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-auto max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Chi tiết bài đăng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Post Status and Type */}
          <div className="mb-4 flex items-center space-x-3">
            {getStatusBadge(post.status)}
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              post.postType === 'cho-thue' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              <FaTag className="mr-1" />
              {post.postType === 'cho-thue' ? 'Cho thuê' : 'Tìm ở ghép'}
            </span>
          </div>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Hình ảnh ({post.images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {post.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${post.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Details */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Tiêu đề</h4>
              <p className="text-base font-semibold text-gray-900">{post.title}</p>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Mô tả</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.description}</p>
            </div>

            {/* Post Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <FaUser className="mr-2" />
                  Người đăng
                </h4>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {post.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getUserDisplayName ? getUserDisplayName(post.userId) : (post.user?.name || `User #${post.userId}`)}
                    </p>
                    <p className="text-xs text-gray-500">ID: {post.userId}</p>
                    {getUserContactInfo && (() => {
                      const contactInfo = getUserContactInfo(post.userId);
                      return (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-gray-600 truncate">
                            <span className="font-medium">Email:</span> {contactInfo.email}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">SĐT:</span> {contactInfo.phone}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  Thời gian
                </h4>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Tạo:</span> {formatDate(post.createdAt)}
                  </p>
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Cập nhật:</span> {formatDate(post.updatedAt)}
                  </p>
                </div>
              </div>
            </div>


            {/* Rejection Reason */}
            {post.status === 'rejected' && post.rejectionReason && (
              <div>
                <h4 className="text-sm font-medium text-red-900 mb-1">Lý do từ chối</h4>
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg">
                  {post.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {post.status === 'pending' && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thao tác
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as 'approve' | 'reject' | '')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn thao tác...</option>
                  <option value="approve">Duyệt bài đăng</option>
                  <option value="reject">Từ chối bài đăng</option>
                </select>
              </div>

              {/* Reject Reason */}
              {selectedAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối bài đăng..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAction || (selectedAction === 'reject' && !rejectReason.trim()) || isSubmitting}
                  className={`px-3 py-2 text-sm rounded-lg text-white transition-colors ${
                    selectedAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
