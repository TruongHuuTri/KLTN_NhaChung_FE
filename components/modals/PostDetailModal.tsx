'use client';

import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  category: 'Cho thuê' | 'Tìm ở ghép';
  content: string;
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Hết hạn';
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onApprove?: (postId: number) => void;
}

const PostDetailModal = ({ isOpen, onClose, post, onApprove }: PostDetailModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible || !post) return null;

  const handleClose = () => {
    onClose();
  };

  const handleApprove = () => {
    if (post && onApprove) {
      onApprove(post.id);
      alert(`Đã duyệt bài đăng của ${post.user.name}!`);
      onClose();
    }
  };

  // Mock full content for demo
  const fullContent = `${post.content}

Chi tiết đầy đủ về bài đăng:

🏠 Thông tin phòng:
- Diện tích: 25m²
- Giá thuê: 3.5 triệu/tháng
- Tiện ích: Điều hòa, tủ lạnh, máy giặt
- Vị trí: Gần trường đại học, siêu thị

🚇 Giao thông:
- Cách bến xe bus 200m
- Gần tuyến metro số 1
- Thuận tiện đi làm và học tập

📞 Liên hệ:
- Xem phòng: Thứ 2-6 (9h-17h)
- Chủ nhà: Ms. ${post.user.name}
- Có thể vào ở ngay

✨ Ưu điểm:
- Phòng mới, sạch sẽ
- An ninh tốt 24/7
- Không chung chủ
- Ưu tiên sinh viên, nhân viên văn phòng`;

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
      <div className={`relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-auto p-6 transition-all duration-300 ease-out transform max-h-[90vh] overflow-y-auto ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Bài đăng
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

        {/* Post Info Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                  {post.user.avatar}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-lg font-medium text-gray-900">{post.user.name}</div>
                <div className="text-sm text-gray-600">{post.createdAt}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                post.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                post.status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {post.status}
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thể loại
            </label>
            <select 
              value={post.category}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            >
              <option value="Cho thuê">Cho thuê</option>
              <option value="Tìm ở ghép">Tìm ở ghép</option>
            </select>
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

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className="aspect-square border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center bg-gray-50"
                >
                  <div className="text-center">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm text-gray-500 mt-1">Ảnh {index}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {post.status === 'Chờ duyệt' && onApprove && (
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Duyệt bài
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

export default PostDetailModal;
