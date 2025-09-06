"use client";
import { useMemo, useState } from "react";

type Address = {
  city: string;
  district: string;
  ward: string;
  street: string;
  houseNumber: string;
  showHouseNumber: boolean;
};

function AddressModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (a: Address | null) => void;
  initial?: Partial<Address>;
}) {
  const [f, setF] = useState<Address>({
    city: initial?.city || "",
    district: initial?.district || "",
    ward: initial?.ward || "",
    street: initial?.street || "",
    houseNumber: initial?.houseNumber || "",
    showHouseNumber: initial?.showHouseNumber ?? false,
  });
  const set = (k: keyof Address, v: any) => setF((s) => ({ ...s, [k]: v }));
  if (!open) return null;

  const handleSave = () => {
    const allEmpty =
      !f.city && !f.district && !f.ward && !f.street && !f.houseNumber;
    onSave(allEmpty ? null : f);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
          <div className="px-4 py-3 border-b text-center font-semibold">
            Địa chỉ
          </div>
          <div className="p-4 space-y-3">
            {(
              ["city", "district", "ward", "street", "houseNumber"] as const
            ).map((k) => (
              <input
                key={k}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder={
                  k === "city"
                    ? "Chọn tỉnh, thành phố *"
                    : k === "district"
                    ? "Chọn quận, huyện, thị xã *"
                    : k === "ward"
                    ? "Chọn phường, xã, thị trấn *"
                    : k === "street"
                    ? "Tên đường *"
                    : "Số nhà"
                }
                value={f[k] as string}
                onChange={(e) => set(k, e.target.value)}
              />
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.showHouseNumber}
                onChange={(e) => set("showHouseNumber", e.target.checked)}
              />
              Hiển thị số nhà trong tin rao
            </label>
            <button
              onClick={handleSave}
              className="w-full h-11 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600"
            >
              XONG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  "Hẻm xe hơi",
  "Nhà nở hậu",
  "Nhà tóp hậu",
  "Nhà dính quy hoạch / lộ giới",
  "Nhà chưa hoàn công",
  "Nhà nát",
  "Đất chưa chuyển thổ",
  "Hiện trạng khác",
] as const;

export default function NhaNguyenCanForm() {
  // Địa chỉ + khu/lô + mã căn
  const [addrOpen, setAddrOpen] = useState(false);
  const [addr, setAddr] = useState<Address | null>(null);
  const [khuLo, setKhuLo] = useState(""); // Tên khu / lô
  const [unitCode, setUnitCode] = useState(""); // Mã căn

  // Thông tin chi tiết
  const [loaiHinh, setLoaiHinh] = useState(""); // 1 cột
  const [soPhongNgu, setSoPhongNgu] = useState("");
  const [soVeSinh, setSoVeSinh] = useState("");
  const [huong, setHuong] = useState("");
  const [tongSoTang, setTongSoTang] = useState("");

  // Thông tin khác
  const [noiThat, setNoiThat] = useState("");
  const [tinhTrangSo, setTinhTrangSo] = useState("");
  const [featureSet, setFeatureSet] = useState<Set<string>>(new Set());

  // Diện tích & giá
  const [dtDat, setDtDat] = useState(""); // m² (đất)
  const [dtSuDung, setDtSuDung] = useState(""); // m² (sử dụng)
  const [ngang, setNgang] = useState(""); // m
  const [dai, setDai] = useState(""); // m
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [err, setErr] = useState<{ dtDat?: string; price?: string }>({});
  const onBlurReq = (k: "dtDat" | "price", v: string, m: string) =>
    setErr((s) => ({ ...s, [k]: v.trim() ? undefined : m }));

  // Tiêu đề & mô tả
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const titleCount = useMemo(() => `${title.length}/70 kí tự`, [title]);
  const descCount = useMemo(() => `${desc.length}/1500 kí tự`, [desc]);

  const addrText = addr
    ? [
        addr.showHouseNumber && addr.houseNumber ? addr.houseNumber : "",
        addr.street,
        addr.ward,
        addr.district,
        addr.city,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const toggleFeature = (f: string) =>
    setFeatureSet((s) => {
      const n = new Set(s);
      n.has(f) ? n.delete(f) : n.add(f);
      return n;
    });

  return (
    <div className="space-y-6">
      {/* === ĐỊA CHỈ === */}
      <div>
        <h3 className="text-[20px] font-semibold mb-3">Địa chỉ</h3>

        {/* Tên khu / lô & Mã căn (cùng hàng) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="relative">
            <input
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={khuLo}
              onChange={(e) => setKhuLo(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                              peer-focus:top-[2px] peer-focus:text-xs
                              peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Tên khu / lô
            </label>
          </div>
          <div className="relative">
            <input
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                              peer-focus:top-[2px] peer-focus:text-xs
                              peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Mã căn
            </label>
          </div>
        </div>

        {/* Nút chọn địa chỉ */}
        <button
          type="button"
          onClick={() => setAddrOpen(true)}
          className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <span className={addrText ? "text-gray-900" : "text-gray-400"}>
            {addrText ? (
              <> {addrText} </>
            ) : (
              <>
                Địa chỉ <span className="text-red-500">*</span>
              </>
            )}
          </span>
          <span className="opacity-60">▾</span>
        </button>
      </div>

      {/* === THÔNG TIN CHI TIẾT === */}
      <div>
        <h3 className="text-[20px] font-semibold mb-3">Thông tin chi tiết</h3>

        {/* Loại hình: 1 cột */}
        <div className="relative mb-3">
          <select
            className={`w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-[15px]
                        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none
                        ${loaiHinh === "" ? "text-gray-400" : "text-gray-900"}`}
            value={loaiHinh}
            onChange={(e) => setLoaiHinh(e.target.value)}
          >
            <option value="" disabled hidden>
              Loại hình
            </option>
            <option value="nha-pho">Nhà phố</option>
            <option value="biet-thu">Biệt thự</option>
            <option value="nha-hem">Nhà hẻm</option>
            <option value="nha-cap4">Nhà cấp 4</option>
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            ▾
          </span>
        </div>

        {/* Còn lại: 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Số phòng ngủ */}
          <div className="relative">
            <input
              type="number"
              min={0}
              step={1}
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={soPhongNgu}
              onChange={(e) => setSoPhongNgu(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                              peer-focus:top-[2px] peer-focus:text-xs
                              peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Số phòng ngủ
            </label>
          </div>

          {/* Số phòng vệ sinh */}
          <div className="relative">
            <input
              type="number"
              min={0}
              step={1}
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={soVeSinh}
              onChange={(e) => setSoVeSinh(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                              peer-focus:top-[2px] peer-focus:text-xs
                              peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Số phòng vệ sinh
            </label>
          </div>

          {/* Hướng */}
          <div className="relative">
            <select
              className={`w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-[15px]
                          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none
                          ${huong === "" ? "text-gray-400" : "text-gray-900"}`}
              value={huong}
              onChange={(e) => setHuong(e.target.value)}
            >
              <option value="" disabled hidden>
                Hướng
              </option>
              <option value="dong">Đông</option>
              <option value="tay">Tây</option>
              <option value="nam">Nam</option>
              <option value="bac">Bắc</option>
              <option value="dong-nam">Đông Nam</option>
              <option value="dong-bac">Đông Bắc</option>
              <option value="tay-nam">Tây Nam</option>
              <option value="tay-bac">Tây Bắc</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              ▾
            </span>
          </div>

          {/* Tổng số tầng */}
          <div className="relative">
            <input
              type="number"
              min={0}
              step={1}
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={tongSoTang}
              onChange={(e) => setTongSoTang(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                              peer-focus:top-[2px] peer-focus:text-xs
                              peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Tổng số tầng
            </label>
          </div>
        </div>
      </div>

      {/* === THÔNG TIN KHÁC === */}
      <div>
        <h3 className="text-[20px] font-semibold mb-3">Thông tin khác</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tình trạng sổ / Giấy tờ pháp lý */}
          <div className="relative">
            <select
              className={`w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-[15px]
                          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none
                          ${
                            tinhTrangSo === ""
                              ? "text-gray-400"
                              : "text-gray-900"
                          }`}
              value={tinhTrangSo}
              onChange={(e) => setTinhTrangSo(e.target.value)}
            >
              <option value="" disabled hidden>
                Giấy tờ pháp lý
              </option>
              <option value="co-so-hong">Có sổ hồng</option>
              <option value="cho-so">Đang chờ sổ</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              ▾
            </span>
          </div>

          {/* Tình trạng nội thất */}
          <div className="relative">
            <select
              className={`w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-[15px]
                          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none
                          ${
                            noiThat === "" ? "text-gray-400" : "text-gray-900"
                          }`}
              value={noiThat}
              onChange={(e) => setNoiThat(e.target.value)}
            >
              <option value="" disabled hidden>
                Tình trạng nội thất
              </option>
              <option value="full">Nội thất đầy đủ</option>
              <option value="co-ban">Nội thất cơ bản</option>
              <option value="trong">Nhà trống</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              ▾
            </span>
          </div>
        </div>

        {/* Checklist đặc điểm nhà/đất */}
        <div className="mt-4">
          <div className="text-[13px] text-gray-500 font-semibold mb-2">
            Đặc điểm nhà/đất
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-2">
            {FEATURES.map((f, idx) => (
              <label
                key={f}
                className={`flex items-center justify-between py-3 border-b border-gray-200 text-[15px]
                  ${idx % 2 === 0 ? "md:pr-2" : "md:pl-2"}`}
              >
                <span>{f}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded-md border-gray-300"
                  checked={featureSet.has(f)}
                  onChange={() => toggleFeature(f)}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* === DIỆN TÍCH & GIÁ === */}
      <div>
        <h3 className="text-[20px] font-semibold mb-3">Diện tích & giá</h3>

        {/* 2 hàng: (đất, sử dụng) và (ngang, dài) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Diện tích đất */}
          <div className="relative">
            <input
              className={`peer w-full h-12 rounded-lg border bg-white px-3 pr-12 text-[15px] placeholder-transparent focus:outline-none focus:ring-2
                         ${
                           err.dtDat
                             ? "border-red-400 ring-red-100"
                             : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                         }`}
              placeholder=" "
              value={dtDat}
              onChange={(e) => setDtDat(e.target.value)}
              onBlur={(e) =>
                onBlurReq(
                  "dtDat",
                  e.target.value,
                  "Vui lòng điền diện tích đất"
                )
              }
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                             peer-focus:top-[2px] peer-focus:text-xs
                             peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Diện tích đất <span className="text-red-600">*</span>
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              m²
            </span>
            {err.dtDat && (
              <div className="text-[12px] text-red-500 mt-1">{err.dtDat}</div>
            )}
          </div>

          {/* Diện tích sử dụng */}
          <div className="relative">
            <input
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 pr-12 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={dtSuDung}
              onChange={(e) => setDtSuDung(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                             peer-focus:top-[2px] peer-focus:text-xs
                             peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Diện tích sử dụng
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              m²
            </span>
          </div>

          {/* Chiều ngang */}
          <div className="relative">
            <input
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 pr-10 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={ngang}
              onChange={(e) => setNgang(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                             peer-focus:top-[2px] peer-focus:text-xs
                             peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Chiều ngang
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              m
            </span>
          </div>

          {/* Chiều dài */}
          <div className="relative">
            <input
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 pr-10 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={dai}
              onChange={(e) => setDai(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                             peer-focus:top-[2px] peer-focus:text-xs
                             peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Chiều dài
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              m
            </span>
          </div>
        </div>

        {/* Giá & cọc */}
        <div className="mt-4">
          <div className="relative mb-3">
            <input
              className={`peer w-full h-12 rounded-lg border bg-white px-3 pr-20 text-[15px] placeholder-transparent focus:outline-none focus:ring-2
                         ${
                           err.price
                             ? "border-red-400 ring-red-100"
                             : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                         }`}
              placeholder=" "
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={(e) =>
                onBlurReq("price", e.target.value, "Vui lòng điền giá thuê")
              }
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                             peer-focus:top-[2px] peer-focus:text-xs
                             peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Giá thuê <span className="text-red-600">*</span>
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              đ/tháng
            </span>
            {err.price && (
              <div className="text-[12px] text-red-500 mt-1">{err.price}</div>
            )}
          </div>

          <div className="relative">
            <input
              className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 pr-10 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder=" "
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
            <label
              className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                             peer-focus:top-[2px] peer-focus:text-xs
                             peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
            >
              Số tiền cọc
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              đ
            </span>
          </div>
        </div>
      </div>

      {/* === TIÊU ĐỀ & MÔ TẢ === */}
      <div>
        <h3 className="text-[20px] font-semibold mb-3">
          Tiêu đề tin đăng và Mô tả chi tiết
        </h3>

        <div className="relative mb-1">
          <input
            className="peer w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder=" "
            maxLength={70}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label
            className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                           peer-focus:top-[2px] peer-focus:text-xs
                           peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
          >
            Tiêu đề tin đăng <span className="text-red-600">*</span>
          </label>
        </div>
        <div className="text-xs text-gray-500 mb-3">{titleCount}</div>

        <div className="relative">
          <textarea
            className="peer w-full rounded-lg border border-gray-300 bg-white px-3 pt-5 min-h-[140px] text-[15px] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder=" "
            maxLength={1500}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <label
            className="pointer-events-none absolute left-3 top-3 text-gray-500 transition-all
                           peer-focus:top-[2px] peer-focus:text-xs
                           peer-[&:not(:placeholder-shown)]:top-[2px] peer-[&:not(:placeholder-shown)]:text-xs"
          >
            Mô tả chi tiết <span className="text-red-600">*</span>
          </label>
        </div>
        <div className="text-xs text-gray-500 mt-1">{descCount}</div>
      </div>

      <AddressModal
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        onSave={(a) => setAddr(a)}
        initial={addr || undefined}
      />
    </div>
  );
}
