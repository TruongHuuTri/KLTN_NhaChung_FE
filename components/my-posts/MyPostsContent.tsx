"use client";

import { useState, useMemo } from "react";
import Pagination from "../common/Pagination";

interface Post {
  id: number;
  title: string;
  category: string;
  price: number;
  area: number;
  address: string;
  status: "active" | "pending" | "inactive";
  views: number;
  createdAt: string;
  images: string[];
}

interface MyPostsContentProps {
  posts: Post[];
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function MyPostsContent({ posts, onEdit, onView, onDelete }: MyPostsContentProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPosts = useMemo(() => {
    return activeTab === "all" 
      ? posts 
      : posts.filter(post => post.status === activeTab);
  }, [posts, activeTab]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  const getTabCount = (status: string) => {
    if (status === "all") return posts.length;
    return posts.filter(post => post.status === status).length;
  };

  const tabCounts = {
    all: getTabCount("all"),
    active: getTabCount("active"),
    pending: getTabCount("pending"),
    inactive: getTabCount("inactive"),
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: "all" | "active" | "pending" | "inactive") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Đang hiển thị";
      case "pending": return "Chờ duyệt";
      case "inactive": return "Đã ẩn";
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng bài đăng</p>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hiển thị</p>
              <p className="text-2xl font-bold text-gray-900">{tabCounts.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{tabCounts.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">👁️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lượt xem</p>
              <p className="text-2xl font-bold text-gray-900">{posts.reduce((sum, post) => sum + post.views, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "all", label: "Tất cả", count: tabCounts.all },
              { id: "active", label: "Đang hiển thị", count: tabCounts.active },
              { id: "pending", label: "Chờ duyệt", count: tabCounts.pending },
              { id: "inactive", label: "Đã ẩn", count: tabCounts.inactive },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {paginatedPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài đăng nào</h3>
            <p className="text-gray-500">Bắt đầu tạo bài đăng đầu tiên của bạn</p>
          </div>
        ) : (
          paginatedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  <div className="lg:w-48 flex-shrink-0">
                    <img
                      src={post.images[0] || '/home/room1.png'}
                      alt={post.title}
                      className="w-full h-32 lg:h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span>📍 {post.address}</span>
                            <span>📐 {post.area}m²</span>
                            <span>💰 {formatPrice(post.price)}đ/tháng</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span>📂 Danh mục: {
                              post.category === 'phong-tro' ? 'Phòng trọ' :
                              post.category === 'chung-cu' ? 'Chung cư' :
                              'Nhà nguyên căn'
                            }</span>
                            <span>📅 Đăng ngày: {formatDate(post.createdAt)}</span>
                            <span>👁️ {post.views} lượt xem</span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {getStatusText(post.status)}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(post.id)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => onView(post.id)}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => onDelete(post.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredPosts.length}
        />
      )}
    </div>
  );
}
