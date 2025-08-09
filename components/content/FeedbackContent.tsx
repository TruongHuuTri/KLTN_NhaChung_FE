'use client';

import React, { useState } from 'react';
import FeedbackDetailModal from '@/components/modals/FeedbackDetailModal';
import ReplyFeedbackModal from '@/components/modals/ReplyFeedbackModal';

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

const FeedbackContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedbacks, setSelectedFeedbacks] = useState<number[]>([]);
  const [isFeedbackDetailModalOpen, setIsFeedbackDetailModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<Feedback | null>(null);

  const feedbacks: Feedback[] = [
    {
      id: 1,
      user: { name: 'Kristin Watson', avatar: '👩' },
      createdAt: '06/08/2025 13:45',
      title: 'Tư vấn...',
      content: 'Tôi muốn tư vấn pháp lý...',
      status: 'Đã phản hồi'
    },
    {
      id: 2,
      user: { name: 'Marvin McKinney', avatar: '👨' },
      createdAt: '05/07/2025 16:35',
      title: 'Vấn đề về tài...',
      content: 'Giao diện khó dùng, tôi đã sử dụng...',
      status: 'Chưa phản hồi'
    },
    {
      id: 3,
      user: { name: 'Jane Cooper', avatar: '👩' },
      createdAt: '06/08/2025 11:00',
      title: 'Hỗ trợ pháp lý',
      content: 'Bà bác bía...',
      status: 'Đã phản hồi'
    },
    {
      id: 4,
      user: { name: 'Cody Fisher', avatar: '👨' },
      createdAt: '26/12/2025 12:03',
      title: 'Hỗ trợ...',
      content: 'Tôi yêu em...',
      status: 'Đã phản hồi'
    },
    {
      id: 5,
      user: { name: 'Bessie Cooper', avatar: '👩' },
      createdAt: '17/12/2025 08:35',
      title: 'Hướng dẫn...',
      content: 'Hướng dẫn dùng web...',
      status: 'Chưa phản hồi'
    }
  ];

  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFeedbacks(filteredFeedbacks.map(feedback => feedback.id));
    } else {
      setSelectedFeedbacks([]);
    }
  };

  const handleSelectFeedback = (feedbackId: number, checked: boolean) => {
    if (checked) {
      setSelectedFeedbacks([...selectedFeedbacks, feedbackId]);
    } else {
      setSelectedFeedbacks(selectedFeedbacks.filter(id => id !== feedbackId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFeedbacks.length > 0) {
      alert(`Xóa ${selectedFeedbacks.length} phản hồi đã chọn`);
      setSelectedFeedbacks([]);
    }
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsFeedbackDetailModalOpen(true);
  };

  const handleCloseFeedbackDetailModal = () => {
    setSelectedFeedback(null);
    setIsFeedbackDetailModalOpen(false);
  };

  const handleOpenReplyModal = (feedback: Feedback) => {
    setReplyFeedback(feedback);
    setIsReplyModalOpen(true);
    setIsFeedbackDetailModalOpen(false); // Đóng modal chi tiết
  };

  const handleCloseReplyModal = () => {
    setReplyFeedback(null);
    setIsReplyModalOpen(false);
  };

  const handleSendReply = (feedbackId: number, replyData: { title: string; content: string }) => {
    // Logic để gửi phản hồi email tới user
    console.log(`Gửi phản hồi cho feedback ID: ${feedbackId}`, replyData);
    
    // TODO: Gọi API để gửi email và cập nhật trạng thái feedback
    // Tạm thời chỉ log để demo
  };



  const getStatusStyle = (status: Feedback['status']) => {
    switch (status) {
      case 'Đã phản hồi':
        return 'bg-green-100 text-green-800';
      case 'Chưa phản hồi':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Xuất CSV
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V5a2 2 0 012-2h8a2 2 0 012 2v6.05"
                  />
                </svg>
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
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
                placeholder="Tìm kiếm theo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Feedback Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFeedbacks.length === filteredFeedbacks.length && filteredFeedbacks.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian gửi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tình trạng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFeedbacks.includes(feedback.id)}
                        onChange={(e) => handleSelectFeedback(feedback.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                            {feedback.user.avatar}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {feedback.user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{feedback.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{feedback.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {feedback.content}
                        <button 
                          onClick={() => handleViewFeedback(feedback)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Xem thêm
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete Button */}
          {selectedFeedbacks.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Xoá ({selectedFeedbacks.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Support Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Hỗ trợ</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>

      {/* Feedback Detail Modal */}
      <FeedbackDetailModal 
        isOpen={isFeedbackDetailModalOpen}
        onClose={handleCloseFeedbackDetailModal}
        feedback={selectedFeedback}
        onOpenReplyModal={handleOpenReplyModal}
      />

      {/* Reply Feedback Modal */}
      <ReplyFeedbackModal 
        isOpen={isReplyModalOpen}
        onClose={handleCloseReplyModal}
        feedback={replyFeedback}
        onSendReply={handleSendReply}
      />
    </div>
  );
};

export default FeedbackContent;
