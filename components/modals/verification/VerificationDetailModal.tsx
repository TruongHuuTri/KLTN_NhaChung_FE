'use client';

import React, { useState, useEffect } from 'react';
import { VerificationWithImages } from '../../../services/verificationService';

interface VerificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationId: number | null;
  getVerificationImages: (verificationId: number) => Promise<VerificationWithImages>;
  getVerificationWithImages: (verificationId: number) => Promise<VerificationWithImages>;
  approveVerification: (verificationId: number, adminNote?: string) => Promise<void>;
  rejectVerification: (verificationId: number, adminNote: string) => Promise<void>;
}

export default function VerificationDetailModal({
  isOpen,
  onClose,
  verificationId,
  getVerificationImages,
  getVerificationWithImages,
  approveVerification,
  rejectVerification
}: VerificationDetailModalProps) {
  const [verification, setVerification] = useState<VerificationWithImages | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (isOpen && verificationId) {
      loadVerificationDetails();
    }
  }, [isOpen, verificationId]);

  const loadVerificationDetails = async () => {
    if (!verificationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getVerificationWithImages(verificationId);
      setVerification(data);
    } catch (err) {
      console.error('Error loading verification details:', err);
      setError('Không thể tải thông tin xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVerification(null);
    setError(null);
    setAdminNote('');
    onClose();
  };

  const handleApprove = async () => {
    if (!verification?.verificationId) return;
    
    setActionLoading(true);
    try {
      await approveVerification(verification.verificationId, adminNote);
      alert('Duyệt hồ sơ thành công');
      handleClose();
    } catch (error) {
      alert('Lỗi khi duyệt hồ sơ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!verification?.verificationId) return;
    
    if (!adminNote.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setActionLoading(true);
    try {
      await rejectVerification(verification.verificationId, adminNote);
      alert('Từ chối hồ sơ thành công');
      handleClose();
    } catch (error) {
      alert('Lỗi khi từ chối hồ sơ');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

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
      <div className={`relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out transform ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Chi tiết xác thực danh tính
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

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {verification && !loading && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin người dùng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Họ tên', value: verification.fullName },
                      { label: 'Số CCCD', value: verification.idNumber },
                      { label: 'Ngày sinh', value: new Date(verification.dateOfBirth).toLocaleDateString('vi-VN') },
                      { label: 'Giới tính', value: verification.gender === 'male' ? 'Nam' : 'Nữ' },
                      { label: 'Nơi cấp', value: verification.issuePlace },
                      { label: 'Ngày cấp', value: new Date(verification.issueDate).toLocaleDateString('vi-VN') },
                      { 
                        label: 'Trạng thái', 
                        value: verification.status === 'approved' ? 'Đã duyệt' :
                               verification.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt',
                        className: verification.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  verification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                      },
                      { label: 'Ngày nộp', value: new Date(verification.submittedAt).toLocaleDateString('vi-VN') }
                    ].map((item, index) => (
                      <div key={index}>
                        <span className="font-medium text-gray-700">{item.label}:</span>
                        <span className={`ml-2 text-gray-900 ${item.className ? `px-2 py-1 rounded text-xs ${item.className}` : ''}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Image Links */}
              {verification.images && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Hình ảnh xác thực</h4>
                  <div className="space-y-2">
                    <a
                      href={verification.images.frontImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      📄 Mặt trước CCCD
                    </a>
                    <br />
                    <a
                      href={verification.images.backImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      📄 Mặt sau CCCD
                    </a>
                    <br />
                    <a
                      href={verification.images.faceImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      👤 Ảnh chân dung
                    </a>
                  </div>
                </div>
              )}

              {/* Face Match Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Kết quả Face Match</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {[
                    {
                      label: 'Độ tương đồng',
                      value: `${verification.faceMatchResult.similarity}%`,
                      className: verification.faceMatchResult.similarity >= 80 ? 'bg-green-100 text-green-800' :
                                verification.faceMatchResult.similarity >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                    },
                    {
                      label: 'Độ tin cậy',
                      value: verification.faceMatchResult.confidence === 'high' ? 'Cao' : 'Thấp',
                      className: verification.faceMatchResult.confidence === 'high' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    },
                    {
                      label: 'Kết quả',
                      value: verification.faceMatchResult.match ? 'Khớp' : 'Không khớp',
                      className: verification.faceMatchResult.match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }
                  ].map((item, index) => (
                    <div key={index}>
                      <span className="font-medium text-gray-600">{item.label}:</span>
                      <span className={`ml-2 px-2 py-1 rounded ${item.className}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Note */}
              {verification.adminNote && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-2">Ghi chú của admin</h5>
                  <p className="text-sm text-gray-600">{verification.adminNote}</p>
                </div>
              )}

              {/* Action Buttons for Pending Verifications */}
              {verification.status === 'pending' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-2">Thao tác</h5>
                  <div className="space-y-3">
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Ghi chú (tùy chọn)..."
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Đang xử lý...' : 'Duyệt'}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
