"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  createManualInvoice,
  CreateManualInvoicePayload
} from "@/services/landlordInvoices";
import { useToast } from "@/contexts/ToastContext";
import { extractApiErrorMessage } from "@/utils/api";
import {
  getLandlordContracts,
  getLandlordContractById,
  LandlordContractSummary
} from "@/services/rentalRequests";
import { getRoomById } from "@/services/rooms";
import { FaFilter, FaInfoCircle, FaPlus, FaTrashAlt } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa6";

interface ManualInvoiceFormProps {
  onOpenMaintenanceModal?: () => void;
}

interface OtherItemInput {
  description: string;
  amount: string;
  type: string;
}

type LandlordContractWithExtras = LandlordContractSummary & {
  tenantName?: string;
  roomInfo?: (LandlordContractSummary["roomInfo"] & { buildingName?: string }) | undefined;
};

export default function ManualInvoiceForm({ onOpenMaintenanceModal }: ManualInvoiceFormProps) {
  const { showSuccess, showError } = useToast();
  const searchParams = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contracts, setContracts] = useState<LandlordContractWithExtras[]>([]);
  const [contractSearch, setContractSearch] = useState("");
  const [roomIdToCategory, setRoomIdToCategory] = useState<Record<number, string>>({});
  const [validatingContract, setValidatingContract] = useState(false);
  const [contractLocked, setContractLocked] = useState(false);

  const [form, setForm] = useState({
    contractId: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    dueDate: "",
    electricityStart: "",
    electricityEnd: "",
    waterStart: "",
    waterEnd: "",
    includeRent: true,
    note: "",
  });
  

  const [otherItems, setOtherItems] = useState<OtherItemInput[]>([]);

  useEffect(() => {
    // Tải hợp đồng khi mở trang để sẵn dropdown
    loadContracts();
  }, []);

  // Prefill contractId nếu có trên URL (?contractId=...)
  useEffect(() => {
    const id = searchParams?.get("contractId");
    if (id) {
      setForm((p) => ({ ...p, contractId: id }));
      setContractLocked(true);
    }
  }, [searchParams]);

  // Gợi ý hạn thanh toán: mặc định là cuối tháng hiện tại nếu chưa chọn
  useEffect(() => {
    if (!form.dueDate) {
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const iso = lastDay.toISOString().slice(0, 10);
      setForm((p) => ({ ...p, dueDate: iso }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadContracts = async () => {
    try {
      setLoadingContracts(true);
      const data = await getLandlordContracts();
      const list = (Array.isArray(data) ? data : []) as LandlordContractWithExtras[];
      setContracts(list);

      // Nạp category phòng để hiển thị trong option
      const uniqueRoomIds = Array.from(new Set(list.map((c) => c.roomId).filter(Boolean)));
      const catMap: Record<number, string> = {};
      await Promise.all(uniqueRoomIds.map(async (rid) => {
        try {
          const room = await getRoomById(Number(rid));
          catMap[Number(rid)] = (room as any)?.category || "";
        } catch {}
      }));
      setRoomIdToCategory(catMap);
    } catch (e: any) {
      // Không chặn form nếu lỗi; chỉ thông báo nhẹ
      showError("Không thể tải danh sách hợp đồng", extractApiErrorMessage(e));
    } finally {
      setLoadingContracts(false);
    }
  };

  const filteredContracts = useMemo(() => {
    // Chỉ hiển thị hợp đồng loại single theo yêu cầu
    const base = contracts.filter((c) => (c.contractType ?? "single") === "single");
    if (!contractSearch.trim()) return base;
    const term = contractSearch.toLowerCase();
    return base.filter((c) => {
      const roomNumber = c?.roomInfo?.roomNumber ? String(c.roomInfo.roomNumber) : "";
      const tenant = c?.tenantName || "";
      const contractId = c?.contractId ? String(c.contractId) : "";
      const building = c?.roomInfo?.buildingName || "";
      return [roomNumber, tenant, contractId, building].some((value) =>
        String(value).toLowerCase().includes(term)
      );
    });
  }, [contracts, contractSearch]);

  const selectedContract = useMemo(() => {
    if (!form.contractId) return null;
    return contracts.find((c) => String(c.contractId) === String(form.contractId));
  }, [contracts, form.contractId]);

  const translateCategory = (cat?: string) => {
    if (!cat) return "";
    const map: Record<string, string> = {
      "phong-tro": "Phòng trọ",
      "chung-cu": "Chung cư",
      "nha-nguyen-can": "Nhà nguyên căn",
    };
    return map[cat] || cat;
  };

  const translateContractStatus = (s?: string) => {
    if (!s) return "";
    const map: Record<string, string> = {
      active: "Đang hiệu lực",
      terminated: "Đã kết thúc",
      expired: "Hết hạn",
      cancelled: "Đã hủy",
      pending: "Chờ hiệu lực",
    };
    return map[s] || s;
  };

  const translateInvoiceStatus = (s?: string) => {
    if (!s) return "";
    const map: Record<string, string> = {
      pending: "Chờ thanh toán",
      paid: "Đã thanh toán",
      overdue: "Quá hạn",
      cancelled: "Đã hủy",
      draft: "Nháp",
    };
    return map[s] || s;
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addOtherItem = () => setOtherItems((arr) => [...arr, { description: "", amount: "", type: "" }]);
  const removeOtherItem = (idx: number) => setOtherItems((arr) => arr.filter((_, i) => i !== idx));
  const changeOtherItem = (idx: number, key: keyof OtherItemInput, value: string) => {
    setOtherItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const validate = () => {
    if (!form.contractId) return "Vui lòng nhập Contract ID";
    const month = Number(form.month);
    if (!month || month < 1 || month > 12) return "Tháng không hợp lệ";
    const year = Number(form.year);
    if (!year || year < 2000) return "Năm không hợp lệ";

    const elecStart = form.electricityStart ? Number(form.electricityStart) : undefined;
    const elecEnd = form.electricityEnd ? Number(form.electricityEnd) : undefined;
    if (elecStart !== undefined && elecEnd !== undefined && elecEnd < elecStart) return "Chỉ số điện kết thúc phải ≥ bắt đầu";

    const waterStart = form.waterStart ? Number(form.waterStart) : undefined;
    const waterEnd = form.waterEnd ? Number(form.waterEnd) : undefined;
    if (waterStart !== undefined && waterEnd !== undefined && waterEnd < waterStart) return "Chỉ số nước kết thúc phải ≥ bắt đầu";

    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showError("Lỗi dữ liệu", err);
      return;
    }

    const contractIdNum = Number(String(form.contractId).trim());
    if (!contractIdNum || Number.isNaN(contractIdNum)) {
      showError("Thiếu hợp đồng", "Vui lòng chọn hoặc nhập Contract ID hợp lệ");
      return;
    }

    // Tiền kiểm tra hợp đồng thuộc chủ nhà để tránh 404 không rõ ràng
    try {
      setValidatingContract(true);
      await getLandlordContractById(contractIdNum);
    } catch (e) {
      setValidatingContract(false);
      showError("Hợp đồng không hợp lệ", "Không tìm thấy hợp đồng thuộc tài khoản chủ nhà này");
      return;
    } finally {
      setValidatingContract(false);
    }

    const payload: CreateManualInvoicePayload = {
      contractId: contractIdNum,
      month: Number(form.month),
      year: Number(form.year),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      electricityStart: form.electricityStart ? Number(form.electricityStart) : undefined,
      electricityEnd: form.electricityEnd ? Number(form.electricityEnd) : undefined,
      waterStart: form.waterStart ? Number(form.waterStart) : undefined,
      waterEnd: form.waterEnd ? Number(form.waterEnd) : undefined,
      includeRent: form.includeRent,
      note: form.note || undefined,
      otherItems: otherItems
        .filter((it) => it.description && it.amount)
        .map((it) => ({ description: it.description, amount: Number(it.amount), type: it.type || "other" })),
    };

    try {
      setSubmitting(true);
      const res = await createManualInvoice(payload);
      setResult(res);
      showSuccess("Tạo hóa đơn thành công", `Mã hoá đơn #${res.invoiceId}`);

      // Reset form về trạng thái mới cho lần tạo tiếp theo (giữ lại hợp đồng)
      const now = new Date();
      const nextForm = {
        contractId: form.contractId,
        month: String(now.getMonth() + 1),
        year: String(now.getFullYear()),
        dueDate: "",
        electricityStart: "",
        electricityEnd: "",
        waterStart: "",
        waterEnd: "",
        includeRent: true,
        note: "",
      };
      setForm(nextForm);
      setOtherItems([]);
    } catch (error) {
      const msg = extractApiErrorMessage(error);
      const body = (error as any)?.body;
      const detail = body ? ` (chi tiết: ${JSON.stringify(body)})` : '';
      // Thông báo thân thiện cho case tổng tiền rỗng theo hướng dẫn BE
      if (String(msg).toLowerCase().includes('invoice has no payable items')) {
        showError("Không thể tạo hoá đơn", "Không có khoản phải thu. Hãy bật tiền thuê hoặc nhập điện/nước/khoản khác > 0.");
      } else {
        showError("Không thể tạo hoá đơn", `${msg}${detail}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const electricityUsage = useMemo(() => {
    if (!form.electricityStart || !form.electricityEnd) return null;
    const start = Number(form.electricityStart);
    const end = Number(form.electricityEnd);
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    const diff = end - start;
    return diff >= 0 ? diff : null;
  }, [form.electricityStart, form.electricityEnd]);

  const waterUsage = useMemo(() => {
    if (!form.waterStart || !form.waterEnd) return null;
    const start = Number(form.waterStart);
    const end = Number(form.waterEnd);
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    const diff = end - start;
    return diff >= 0 ? diff : null;
  }, [form.waterStart, form.waterEnd]);

  const totalExtraItems = useMemo(() => {
    return otherItems.reduce((sum, curr) => {
      const amount = Number(curr.amount);
      if (Number.isNaN(amount)) return sum;
      return sum + amount;
    }, 0);
  }, [otherItems]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tạo hoá đơn thủ công</h2>
          <p className="text-sm text-slate-500">
            Chuẩn bị số liệu, chọn hợp đồng và nhập nhanh các khoản phí trong kỳ.
          </p>
        </div>
        {onOpenMaintenanceModal && (
          <button
            onClick={onOpenMaintenanceModal}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-600"
          >
            Thanh toán phí duy trì
          </button>
        )}
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Thông tin hợp đồng</h3>
          <p className="text-xs text-slate-500">
            Chọn hợp đồng đang hiệu lực để hệ thống biết phòng nào cần tính tiền.
          </p>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tìm nhanh hợp đồng
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <FaFilter className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
                    placeholder="Nhập mã hợp đồng, phòng hoặc tên khách"
                    value={contractSearch}
                    onChange={(e) => setContractSearch(e.target.value)}
                    disabled={contractLocked}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chọn hợp đồng
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
                  value={form.contractId}
                  onChange={(e) => setForm((prev) => ({ ...prev, contractId: e.target.value }))}
                  disabled={contractLocked}
                >
                  <option value="">
                    {loadingContracts ? "Đang tải hợp đồng..." : "-- Chọn hợp đồng --"}
                  </option>
                  {filteredContracts.map((c: LandlordContractWithExtras) => {
                    const cat = translateCategory(roomIdToCategory[c.roomId]);
                    const label = [
                      `Phòng ${c?.roomInfo?.roomNumber ?? "?"}`,
                      cat,
                      c?.roomInfo?.buildingName
                    ]
                      .filter(Boolean)
                      .join(" • ");
                    return (
                      <option key={c.contractId} value={String(c.contractId)}>
                        {label} ({translateContractStatus(c?.status)})
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Nếu không thấy hợp đồng mới, hãy làm mới trang hoặc kiểm tra trạng thái.
                </p>
              </div>
            </div>

            <ContractPreview contract={selectedContract} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Chu kỳ tính tiền</h3>
          <p className="text-xs text-slate-500">
            Điền chính xác tháng, năm và hạn thanh toán cho kỳ hoá đơn này.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tháng</label>
              <input
                name="month"
                value={form.month}
                onChange={onChange}
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Năm</label>
              <input
                name="year"
                value={form.year}
                onChange={onChange}
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hạn thanh toán</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Nếu để trống, hệ thống mặc định cuối tháng hiện tại.
              </p>
            </div>
            <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={form.includeRent}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    includeRent: e.target.checked
                  }))
                }
              />
              Bao gồm tiền thuê tháng
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Chỉ số tiện ích</h3>
          <p className="text-xs text-slate-500">
            Nhập chỉ số đầu và cuối cho điện, nước. Để trống nếu kỳ này không thu.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Điện - chỉ số đầu
              </label>
              <input
                name="electricityStart"
                value={form.electricityStart}
                onChange={onChange}
                type="number"
                min="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Điện - chỉ số cuối
              </label>
              <input
                name="electricityEnd"
                value={form.electricityEnd}
                onChange={onChange}
                type="number"
                min="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nước - chỉ số đầu
              </label>
              <input
                name="waterStart"
                value={form.waterStart}
                onChange={onChange}
                type="number"
                min="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nước - chỉ số cuối
              </label>
              <input
                name="waterEnd"
                value={form.waterEnd}
                onChange={onChange}
                type="number"
                min="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>
              {electricityUsage != null
                ? `Sản lượng điện: ${electricityUsage} kWh`
                : "Để trống nếu chưa có số liệu điện."}
            </p>
            <p>
              {waterUsage != null
                ? `Sản lượng nước: ${waterUsage} m³`
                : "Để trống nếu kỳ này không thu tiền nước."}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Khoản phát sinh khác</h3>
              <p className="text-xs text-slate-500">
                Thêm các khoản như vệ sinh, internet, gửi xe... để khách dễ đối soát.
              </p>
            </div>
            <button
              type="button"
              onClick={addOtherItem}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
            >
              <FaPlus className="h-3.5 w-3.5" />
              Thêm khoản
            </button>
          </div>

          {otherItems.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có khoản phát sinh nào.</p>
          ) : (
            <div className="space-y-3">
              {otherItems.map((it, idx) => (
                <div
                  key={idx}
                  className="grid gap-3 md:grid-cols-[minmax(0,1fr),150px,120px,auto] items-start"
                >
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
                    placeholder="Mô tả (VD: Phí vệ sinh chung)"
                    value={it.description}
                    onChange={(e) => changeOtherItem(idx, "description", e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
                    placeholder="Số tiền"
                    value={it.amount}
                    onChange={(e) => changeOtherItem(idx, "amount", e.target.value)}
                    inputMode="numeric"
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
                    placeholder="Loại (VD: internet)"
                    value={it.type}
                    onChange={(e) => changeOtherItem(idx, "type", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOtherItem(idx)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <span className="inline-flex items-center gap-1">
                      <FaTrashAlt className="h-3.5 w-3.5" />
                      Xóa
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {!!totalExtraItems && (
            <p className="text-xs text-slate-600">
              Tổng các khoản phát sinh:{" "}
              <span className="font-semibold text-teal-600">
                {new Intl.NumberFormat("vi-VN").format(totalExtraItems)} đ
              </span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Ghi chú gửi khách thuê</h3>
          <p className="text-xs text-slate-500">
            Nội dung này sẽ hiển thị trong email và hoá đơn gửi cho khách.
          </p>
          <textarea
            name="note"
            value={form.note}
            onChange={onChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"
            placeholder="Ví dụ: Vui lòng thanh toán trước ngày 25 để tránh phí phạt trễ hạn."
          />
        </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FaInfoCircle className="h-4 w-4" />
              <span>
                Sau khi tạo, hoá đơn sẽ xuất hiện trong lịch sử thu tiền và có thể gửi ngay cho khách.
              </span>
            </div>
            <button
              disabled={submitting || validatingContract}
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Đang tạo..."
                : validatingContract
                ? "Đang kiểm tra hợp đồng..."
                : "Tạo hoá đơn"}
            </button>
          </div>
      </form>

      {result && (
        <InvoiceResultCard result={result} translateInvoiceStatus={translateInvoiceStatus} />
      )}
    </div>
  );
}

function ContractPreview({ contract }: { contract: LandlordContractWithExtras | null | undefined }) {
  if (!contract) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
        <p>Chọn hợp đồng để xem nhanh thông tin phòng, khách thuê và trạng thái.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
        Hợp đồng #{contract.contractId}
      </p>
      <div className="space-y-2 text-xs text-slate-600">
        <PreviewItem label="Khách thuê" value={contract.tenantName || "Không có dữ liệu"} />
        <PreviewItem
          label="Phòng"
          value={`${
            contract?.roomInfo?.roomNumber ? `Phòng ${contract.roomInfo.roomNumber}` : "Không rõ"
          }${contract?.roomInfo?.buildingName ? ` • ${contract.roomInfo.buildingName}` : ""}`}
        />
        <PreviewItem label="Trạng thái" value={translateStatus(contract?.status)} />
        {contract?.startDate && (
          <PreviewItem
            label="Ngày bắt đầu"
            value={new Date(contract.startDate).toLocaleDateString("vi-VN")}
          />
        )}
        {contract?.endDate && (
          <PreviewItem
            label="Ngày kết thúc"
            value={new Date(contract.endDate).toLocaleDateString("vi-VN")}
          />
        )}
      </div>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-24 shrink-0 text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function translateStatus(status?: string) {
  const map: Record<string, string> = {
    active: "Đang hiệu lực",
    pending: "Chờ hiệu lực",
    expired: "Hết hạn",
    terminated: "Đã kết thúc",
    cancelled: "Đã hủy"
  };
  return map[status ?? ""] || "Không rõ";
}

function InvoiceResultCard({
  result,
  translateInvoiceStatus
}: {
  result: any;
  translateInvoiceStatus: (status?: string) => string;
}) {
  return (
    <div className="rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
          <FaMoneyBillWave className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-teal-700">Tạo hoá đơn thành công</p>
          <p className="text-xs text-slate-500">
            Hoá đơn sẽ hiển thị trong danh sách thu tiền và có thể gửi ngay cho khách thuê.
          </p>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Mã hoá đơn</dt>
          <dd className="font-semibold text-slate-900">#{result.invoiceId}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Tổng tiền</dt>
          <dd className="font-semibold text-teal-600">
            {new Intl.NumberFormat("vi-VN").format(result.amount)} đ
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Hạn thanh toán</dt>
          <dd>{new Date(result.dueDate).toLocaleString("vi-VN")}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Trạng thái</dt>
          <dd>{translateInvoiceStatus(result.status)}</dd>
        </div>
      </dl>
      {Array.isArray(result.items) && result.items.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-sm font-semibold text-slate-900">Chi tiết các khoản</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {result.items.map((it: any, i: number) => (
              <li key={i} className="flex justify-between">
                <span>{it.description}</span>
                <span>{new Intl.NumberFormat("vi-VN").format(it.amount)} đ</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


