"use client";

import { useState, useEffect } from "react";
import { updatePost } from "../../services/posts";
import type { LocalMediaItem } from "../common/MediaPickerLocal";
import MediaPickerLocal from "../common/MediaPickerLocal";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onSuccess: () => void;
}

export default function EditPostModal({ isOpen, onClose, post, onSuccess }: EditPostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    phone: '',
    email: '',
    images: [] as string[],
    videos: [] as string[],
    personalInfo: {
      fullName: '',
      age: 0,
      gender: '',
      occupation: '',
      hobbies: [] as string[],
      habits: [] as string[],
      lifestyle: 'normal',
      cleanliness: 'clean'
    },
    requirements: {
      ageRange: [20, 30] as [number, number],
      gender: 'any',
      traits: [] as string[],
      maxPrice: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean } | null>(null);

  // Initialize form data when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        phone: post.phone || '',
        email: post.email || '',
        images: post.images || [],
        videos: post.videos || [],
        personalInfo: post.personalInfo || {
          fullName: '',
          age: 0,
          gender: '',
          occupation: '',
          hobbies: [],
          habits: [],
          lifestyle: 'normal',
          cleanliness: 'clean'
        },
        requirements: post.requirements || {
          ageRange: [20, 30],
          gender: 'any',
          traits: [],
          maxPrice: 0
        }
      });
    }
  }, [post]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleMediaChange = (newMedia: LocalMediaItem[]) => {
    // Separate images and videos
    const images = newMedia.filter(item => (item as any).type === 'image').map(item => (item as any).url);
    const videos = newMedia.filter(item => (item as any).type === 'video').map(item => (item as any).url);
    
    setFormData(prev => ({
      ...prev,
      images,
      videos
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.postId) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare payload - only include fields that are allowed to be updated
      const payload: any = {
        title: formData.title,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        images: formData.images,
        videos: formData.videos
      };

      // Add personalInfo and requirements only for roommate posts
      if (post.postType === 'roommate' || post.postType === 'tim-o-ghep') {
        payload.personalInfo = formData.personalInfo;
        payload.requirements = formData.requirements;
      }

      // Use unified updatePost API
      await updatePost(post.postId, payload);

      setToast({ message: 'Cập nhật bài đăng thành công!', type: 'success', visible: true });
      
      // Auto hide toast and close modal
      setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : prev), 2000);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật bài đăng');
      setToast({ message: 'Có lỗi xảy ra khi cập nhật bài đăng', type: 'error', visible: true });
      setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : prev), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isRoommatePost = post?.postType === 'roommate' || post?.postType === 'tim-o-ghep';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Chỉnh sửa bài đăng
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toast */}
          {toast?.visible && (
            <div className={`mb-4 p-3 rounded-lg ${
              toast.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {toast.message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Personal Info - Only for roommate posts */}
            {isRoommatePost && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.fullName}
                        onChange={(e) => handleInputChange('personalInfo.fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tuổi
                      </label>
                      <input
                        type="number"
                        value={formData.personalInfo.age}
                        onChange={(e) => handleInputChange('personalInfo.age', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <select
                        value={formData.personalInfo.gender}
                        onChange={(e) => handleInputChange('personalInfo.gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nghề nghiệp
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.occupation}
                        onChange={(e) => handleInputChange('personalInfo.occupation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Yêu cầu</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính yêu cầu
                      </label>
                      <select
                        value={formData.requirements.gender}
                        onChange={(e) => handleInputChange('requirements.gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="any">Không yêu cầu</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá tối đa (VNĐ/tháng)
                      </label>
                      <input
                        type="number"
                        value={formData.requirements.maxPrice}
                        onChange={(e) => handleInputChange('requirements.maxPrice', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Media */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hình ảnh & Video</h3>
              <MediaPickerLocal
                onMediaChange={handleMediaChange}
                maxImages={12}
                maxVideos={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật bài đăng'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
