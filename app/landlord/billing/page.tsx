import ManualInvoiceForm from "@/components/landlord/ManualInvoiceForm";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-700">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Tính tiền</h1>
        <p className="text-gray-600 mb-6">Tạo hoá đơn thủ công theo hợp đồng, theo hướng dẫn tích hợp.</p>
        <ManualInvoiceForm />
      </div>
    </div>
  );
}


