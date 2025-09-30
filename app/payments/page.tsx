"use client";

import { useAuth } from "@/contexts/AuthContext";
import PaidInvoices from "@/components/payments/PaidInvoices";

export default function PaymentsPage() {
  const { user, isLoading } = useAuth();

  // Hiển thị loading khi AuthContext đang khởi tạo
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị "Vui lòng đăng nhập" khi AuthContext đã load xong và user thực sự null
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hóa đơn đã thanh toán</h1>
          <p className="text-gray-600 mt-2">Xem lịch sử các hóa đơn đã thanh toán của bạn</p>
        </div>

        {/* Main Content */}
        <PaidInvoices />
      </div>
    </div>
  );
}