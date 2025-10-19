'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { postService, AdminPost, PostFilters, PaginatedResponse } from '@/services/postService';
import { userService } from '@/services/userService';
import PostDetail from '@/components/modals/post/PostDetail';
import { FaEye, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Post = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [userMap, setUserMap] = useState<Map<number, { name: string; email: string; phone: string }>>(new Map());

  // Load user information
  const loadUserInfo = useCallback(async (userId: number) => {
    try {
      if (userMap.has(userId)) return;
      
      const user = await userService.getUserById(userId);
      setUserMap(prev => new Map(prev).set(userId, {
        name: user.name,
        email: user.email,
        phone: user.phone || 'Chưa cập nhật'
      }));
    } catch (error) {
      console.error(`Error loading user ${userId}:`, error);
    }
  }, [userMap]);

  // Load posts from API
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentAdmin) {
        const token = postService.getToken();
        if (token) {
          const data: PaginatedResponse = await postService.getAllPosts({});
          setPosts(data.posts);
          
          // Load user info for all unique user IDs
          const uniqueUserIds = [...new Set(data.posts.map(post => post.userId))];
          for (const userId of uniqueUserIds) {
            await loadUserInfo(userId);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  }, [currentAdmin, loadUserInfo]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Client-side filtering
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesType = postTypeFilter === 'all' || post.postType === postTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewPost = (post: AdminPost) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedPost(null);
    setIsDetailModalOpen(false);
  };

  const handleStatusChange = async (postId: number, status: 'approve' | 'reject', reason?: string) => {
    try {
      if (status === 'approve') {
        await postService.approvePost(postId);
        alert('Duyệt bài đăng thành công!');
        // Update local state
        setPosts(posts.map(post => 
          post.postId === postId 
            ? { ...post, status: 'active', updatedAt: new Date().toISOString() }
            : post
        ));
      } else if (status === 'reject' && reason) {
        await postService.rejectPost(postId, reason);
        alert('Từ chối bài đăng thành công!');
        // Update local state
        setPosts(posts.map(post => 
          post.postId === postId 
            ? { ...post, status: 'rejected', rejectionReason: reason, updatedAt: new Date().toISOString() }
            : post
        ));
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái bài đăng');
    }
  };


  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handlePostTypeFilterChange = (value: string) => {
    setPostTypeFilter(value);
  };

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

  const getUserDisplayName = (userId: number) => {
    const userInfo = userMap.get(userId);
    if (userInfo) {
      return userInfo.name;
    }
    return `User #${userId}`;
  };

  const getUserContactInfo = (userId: number) => {
    const userInfo = userMap.get(userId);
    if (userInfo) {
      return {
        email: userInfo.email,
        phone: userInfo.phone
      };
    }
    return {
      email: 'Chưa cập nhật',
      phone: 'Chưa cập nhật'
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý bài đăng</h1>
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
                    placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="block w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="active">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </div>

                {/* Post Type Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={postTypeFilter}
                    onChange={(e) => handlePostTypeFilterChange(e.target.value)}
                    className="block w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="cho-thue">Cho thuê</option>
                    <option value="tim-o-ghep">Tìm ở ghép</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <div className="mt-3">
                    <button
                      onClick={() => loadPosts()}
                      className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Đang tải danh sách bài đăng...</p>
                    <p className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Table */}
          {!loading && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto max-h-[70vh]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Tiêu đề
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Người đăng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post, index) => (
                      <tr key={post.postId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={post.title}>
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate" title={post.description}>
                            {post.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.postType === 'cho-thue' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {post.postType === 'cho-thue' ? 'Cho thuê' : 'Tìm ở ghép'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getUserDisplayName(post.userId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(post.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewPost(post)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs flex items-center"
                            title="Xem chi tiết"
                          >
                            <FaEye className="mr-1" />
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {searchTerm || statusFilter !== 'all' || postTypeFilter !== 'all' 
                                ? 'Không tìm thấy bài đăng nào' 
                                : 'Chưa có bài đăng nào'}
                            </h3>
                            <p className="text-gray-500">
                              {searchTerm || statusFilter !== 'all' || postTypeFilter !== 'all' 
                                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' 
                                : 'Các bài đăng mới sẽ xuất hiện ở đây'}
                            </p>
                            {(searchTerm || statusFilter !== 'all' || postTypeFilter !== 'all') && (
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setStatusFilter('all');
                                  setPostTypeFilter('all');
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                              >
                                Xóa bộ lọc
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Filter Status and Clear Button */}
          {!loading && (searchTerm || statusFilter !== 'all' || postTypeFilter !== 'all') && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md font-medium text-sm">
                  Đã lọc
                </span>
                <span className="text-sm text-gray-600">
                  {filteredPosts.length} / {posts.length} bài đăng
                </span>
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPostTypeFilter('all');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetail
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        post={selectedPost}
        onStatusChange={handleStatusChange}
        getUserDisplayName={getUserDisplayName}
        getUserContactInfo={getUserContactInfo}
      />

    </div>
  );
};

export default Post;
