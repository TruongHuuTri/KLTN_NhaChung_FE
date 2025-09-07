"use client";

// import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import VerificationModal, { VerificationData } from './VerificationModal';
import ChangePasswordModal, { ChangePasswordData } from './ChangePasswordModal';

interface AccountSettingsProps {
  isVerified?: boolean;
  onVerificationComplete?: (data: VerificationData) => void;
}

export default function AccountSettings({ isVerified = false, onVerificationComplete }: AccountSettingsProps) {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleVerificationComplete = (data: VerificationData) => {
    console.log('Verification data:', data);
    onVerificationComplete?.(data);
    setIsVerificationModalOpen(false);
  };

  const handleChangePassword = (data: ChangePasswordData) => {
    console.log('Change password data:', data);
    // TODO: Gọi API đổi mật khẩu
    alert('Đổi mật khẩu thành công!');
  };

  return (
    <>
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Cài đặt tài khoản</h3>
        <div className="space-y-4">
          {isVerified ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Đã xác thực danh tính</h4>
                  <p className="text-sm text-gray-600">Tài khoản đã được xác thực, có thể đăng tin cho thuê</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                Đã xác thực
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <span className="text-amber-600 text-lg">⚠</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Chưa xác thực danh tính</h4>
                  <p className="text-sm text-gray-600">Xác thực để có thể đăng tin cho thuê</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVerificationModalOpen(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                Xác thực ngay
              </button>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
              <p className="text-sm text-gray-600">Cập nhật mật khẩu mới</p>
            </div>
            <button 
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerify={handleVerificationComplete}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </>
  );
}
