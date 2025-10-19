'use client';

import React, { useState } from 'react';
import { useAdminVerifications } from '../../hooks/useAdminVerifications';
import VerificationActionModal from '../modals/verification/VerificationActionModal';

export default function Verification() {
  const {
    verifications,
    pagination,
    loading,
    error,
    fetchVerifications,
    approveVerification,
    rejectVerification
  } = useAdminVerifications();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    const filters = status === 'all' ? {} : { status: status as 'pending' | 'approved' | 'rejected' };
    fetchVerifications(filters);
  };

  const openActionModal = (verification: any, type: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleConfirmAction = async (verificationId: number, adminNote: string) => {
    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await approveVerification(verificationId, adminNote);
      } else {
        await rejectVerification(verificationId, adminNote);
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      case 'pending': return 'Chờ duyệt';
      default: return 'Không xác định';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getFaceMatchColor = (similarity: number) => {
    if (similarity >= 80) return 'text-green-600';
    if (similarity >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: string) => {
    return confidence === 'high' ? 'text-green-600' : 'text-red-600';
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý xác thực danh tính</h1>
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
                {/* Status Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="block w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải danh sách xác thực...</span>
            </div>
          )}

          {/* Verifications Table */}
          {!loading && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số CCCD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Face Match
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày nộp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {verifications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu xác thực
                  </td>
                </tr>
              ) : (
                verifications.map((verification) => (
                  <tr key={verification.verificationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {verification.verificationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {verification.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {verification.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {verification.idNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(verification.status)}`}>
                        {getStatusText(verification.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className={`font-medium ${getFaceMatchColor(verification.faceMatchResult.similarity)}`}>
                          {verification.faceMatchResult.similarity}%
                        </div>
                        <div className={`text-xs ${getConfidenceColor(verification.faceMatchResult.confidence)}`}>
                          {verification.faceMatchResult.confidence === 'high' ? 'Cao' : 'Thấp'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(verification.submittedAt)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {verification.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openActionModal(verification, 'approve')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => openActionModal(verification, 'reject')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Không thể thao tác</span>
                        )}
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{verifications.length}</span> trong tổng số{' '}
                <span className="font-medium">{pagination.total}</span> hồ sơ
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchVerifications({ status: selectedStatus === 'all' ? undefined : selectedStatus as 'pending' | 'approved' | 'rejected', page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchVerifications({ status: selectedStatus === 'all' ? undefined : selectedStatus as 'pending' | 'approved' | 'rejected', page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}

          {/* Action Modal */}
          <VerificationActionModal
            isOpen={showActionModal}
            onClose={() => setShowActionModal(false)}
            verification={selectedVerification}
            actionType={actionType}
            onConfirm={handleConfirmAction}
            loading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
}
