"use client";

import { useState, useEffect } from "react";
import { 
  getPendingInvoices, 
  formatInvoiceType, 
  formatPaymentStatus, 
  formatCurrency,
  isInvoiceOverdue,
  calculateOverdueDays,
  Invoice
} from "@/services/payments";
import PaymentQR from "./PaymentQR";
import { useToast } from "@/contexts/ToastContext";
import { ToastMessages } from "@/utils/toastMessages";

export default function PendingInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getPendingInvoices();
      setInvoices(data);
    } catch (error: any) {
      const message = ToastMessages.error.load('Danh sách hóa đơn');
      showError(message.title, error.message || message.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setSelectedInvoice(null);
    loadInvoices(); // Reload invoices after successful payment
    const message = ToastMessages.success.process('Hóa đơn');
    showSuccess(message.title, message.message);
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

  const getInvoiceStatusColor = (invoice: Invoice) => {
    if (isInvoiceOverdue(invoice)) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getInvoiceStatusText = (invoice: Invoice) => {
    if (isInvoiceOverdue(invoice)) {
      const overdueDays = calculateOverdueDays(invoice);
      return `Quá hạn ${overdueDays} ngày`;
    }
    return 'Chờ thanh toán';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hóa đơn cần thanh toán</h1>
        <p className="text-gray-600">Thanh toán các hóa đơn để hoàn tất quá trình thuê phòng</p>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có hóa đơn nào</h3>
          <p className="text-gray-500">Bạn chưa có hóa đơn nào cần thanh toán</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.invoiceId} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Hóa đơn #{invoice.invoiceId}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getInvoiceStatusColor(invoice)}`}>
                      {getInvoiceStatusText(invoice)}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Loại:</strong> {formatInvoiceType(invoice.invoiceType)}</p>
                      <p><strong>Số tiền:</strong> {formatCurrency(invoice.amount)}</p>
                    </div>
                    <div>
                      <p><strong>Hạn thanh toán:</strong> {formatDate(invoice.dueDate)}</p>
                      {invoice.roomNumber && (
                        <p><strong>Phòng:</strong> {invoice.roomNumber}</p>
                      )}
                    </div>
                  </div>

                  {invoice.description && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <span className="font-medium text-blue-900">Mô tả: </span>
                      <span className="text-blue-800">{invoice.description}</span>
                    </div>
                  )}

                  {isInvoiceOverdue(invoice) && (
                    <div className="mt-3 p-2 bg-red-50 rounded text-sm border border-red-200">
                      <span className="font-medium text-red-900">⚠️ Quá hạn thanh toán: </span>
                      <span className="text-red-800">
                        Hóa đơn này đã quá hạn {calculateOverdueDays(invoice)} ngày. 
                        Vui lòng thanh toán sớm để tránh phí phạt.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p><strong>Trạng thái:</strong> {formatPaymentStatus('pending')}</p>
                  </div>
                  <div className="flex gap-3">
                    {invoice.canPay && (
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Thanh toán
                      </button>
                    )}
                    {!invoice.canPay && (
                      <span className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg">
                        Không thể thanh toán
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment QR Modal */}
      {selectedInvoice && (
        <PaymentQR
          invoiceId={selectedInvoice.invoiceId}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}