"use client";

import { useState } from "react";
import ManualInvoiceForm from "@/components/landlord/ManualInvoiceForm";
import MaintenanceFeePaymentModal from "@/components/landlord/MaintenanceFeePaymentModal";
import Footer from "@/components/common/Footer";

export default function BillingPage() {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 lg:px-6">
        <ManualInvoiceForm onOpenMaintenanceModal={() => setShowMaintenanceModal(true)} />
      </div>

      <MaintenanceFeePaymentModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
      />

      <Footer />
    </div>
  );
}
