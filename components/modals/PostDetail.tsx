'use client';

import React from 'react';

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  title: string;
  description: string;
  price: number;
  address: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface PostDetailProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onApprove?: (postId: number) => void;
  onReject?: (postId: number) => void;
}

const PostDetail = ({ isOpen, onClose, post, onApprove, onReject }: PostDetailProps) => {
  if (!isOpen || !post) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Đã duyệt' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Từ chối' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: status };
    
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
            Chi tiết bài đăng
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
          {/* Post Status */}
          <div className="mb-6">
            {getStatusBadge(post.status)}
          </div>

          {/* Post Images */}
          {post.images.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Hình ảnh</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tiêu đề</h4>
              <p className="text-lg font-semibold text-gray-900">{post.title}</p>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Mô tả</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Giá thuê</h4>
              <p className="text-2xl font-bold text-green-600">{formatPrice(post.price)}/tháng</p>
            </div>

            {/* Address */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Địa chỉ</h4>
              <p className="text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {post.address}
              </p>
            </div>

            {/* User Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Người đăng</h4>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-gray-600">
                    {post.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{post.user.name}</p>
                  <p className="text-xs text-gray-500">Đăng lúc {formatDate(post.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {post.status === 'pending' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => onReject?.(post.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Từ chối
            </button>
            <button
              onClick={() => onApprove?.(post.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Duyệt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
