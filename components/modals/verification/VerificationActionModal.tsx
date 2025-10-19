'use client';

import React, { useState } from 'react';
import { Verification } from '../../../services/verificationService';

interface VerificationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: Verification | null;
  actionType: 'approve' | 'reject';
  onConfirm: (verificationId: number, adminNote: string) => Promise<void>;
  loading?: boolean;
}

export default function VerificationActionModal({
  isOpen,
  onClose,
  verification,
  actionType,
  onConfirm,
  loading = false
}: VerificationActionModalProps) {
  const [adminNote, setAdminNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (actionType === 'reject' && !adminNote.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    if (verification) {
      try {
        await onConfirm(verification.verificationId, adminNote);
        setAdminNote('');
        onClose();
      } catch (error) {
        // Error is handled in the parent component
      }
    }
  };

  const handleClose = () => {
    setAdminNote('');
    onClose();
  };

  if (!isOpen || !verification) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {actionType === 'approve' ? 'Duyệt hồ sơ xác thực' : 'Từ chối hồ sơ xác thực'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Verification Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Thông tin hồ sơ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <span className="ml-2 text-gray-900">{verification.userId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Họ tên:</span>
                <span className="ml-2 text-gray-900">{verification.fullName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Số CCCD:</span>
                <span className="ml-2 text-gray-900">{verification.idNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Giới tính:</span>
                <span className="ml-2 text-gray-900">
                  {verification.gender === 'male' ? 'Nam' : 'Nữ'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày sinh:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(verification.dateOfBirth).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nơi cấp:</span>
                <span className="ml-2 text-gray-900">{verification.issuePlace}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Trạng thái:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(verification.status)}`}>
                  {getStatusText(verification.status)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày nộp:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(verification.submittedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Face Match Result */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-700 mb-2">Kết quả Face Match</h5>
              <div className="flex items-center space-x-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Độ tương đồng:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${
                    verification.faceMatchResult.similarity >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : verification.faceMatchResult.similarity >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.faceMatchResult.similarity}%
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Độ tin cậy:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${
                    verification.faceMatchResult.confidence === 'high' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.faceMatchResult.confidence === 'high' ? 'Cao' : 'Thấp'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Kết quả:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${
                    verification.faceMatchResult.match 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.faceMatchResult.match ? 'Khớp' : 'Không khớp'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Note Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="adminNote" className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Ghi chú (tùy chọn)' : 'Lý do từ chối (bắt buộc)'}
              </label>
              <textarea
                id="adminNote"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Nhập ghi chú về việc duyệt hồ sơ...'
                    : 'Nhập lý do từ chối hồ sơ xác thực...'
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={actionType === 'reject'}
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (actionType === 'approve' ? 'Duyệt hồ sơ' : 'Từ chối hồ sơ')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
