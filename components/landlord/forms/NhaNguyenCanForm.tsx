"use client";

import { useState, useEffect } from "react";
import { Building } from "@/types/Building";
import { Address } from "@/types/RentPost";
import { CreateRoomPayload, DirectionType, FurnitureType, LegalStatusType } from "@/types/Room";
import { uploadFiles } from "@/utils/upload";
import { useAuth } from "@/contexts/AuthContext";
import MediaPickerPanel, { LocalMediaItem } from "../../common/MediaPickerLocal";

export default function NhaNguyenCanForm({
  building,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  existingRooms = [], // Danh sách phòng hiện có để kiểm tra trùng
}: {
  building: Building;
  initialData?: Partial<CreateRoomPayload>;
  onSubmit: (data: CreateRoomPayload) => void;
  onCancel: () => void;
  loading?: boolean;
  existingRooms?: Array<{ roomNumber: string; id?: number }>; // Để kiểm tra trùng
}) {
  console.log("🏠 NhaNguyenCanForm initialized with existingRooms:", existingRooms);
  const { user } = useAuth();
  const [mediaImages, setMediaImages] = useState<LocalMediaItem[]>([]);
  const [mediaVideos, setMediaVideos] = useState<LocalMediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [roomNumberError, setRoomNumberError] = useState<string>("");

  // Kiểm tra form có đầy đủ không
  const isFormValid = () => {
    return (
      form.roomNumber.trim() !== "" &&
      form.area > 0 &&
      form.price > 0 &&
      form.deposit > 0 &&
      (form.bedrooms || 0) > 0 &&
      (form.bathrooms || 0) > 0 &&
      form.direction !== undefined &&
      form.legalStatus !== undefined &&
      form.nhaNguyenCanInfo?.khuLo?.trim() !== "" &&
      form.nhaNguyenCanInfo?.unitCode?.trim() !== "" &&
      form.nhaNguyenCanInfo?.propertyType !== "" &&
      (form.nhaNguyenCanInfo?.totalFloors || 0) > 0 &&
      (form.nhaNguyenCanInfo?.landArea || 0) > 0 &&
      (form.nhaNguyenCanInfo?.width || 0) > 0 &&
      (form.nhaNguyenCanInfo?.length || 0) > 0 &&
      roomNumberError === ""
    );
  };

  const [form, setForm] = useState<CreateRoomPayload>({
    buildingId: building.buildingId,
    roomNumber: "",
    floor: 1,
    area: 0,
    price: 0,
    deposit: 0,
    furniture: "full",
    bedrooms: 1,
    bathrooms: 1,
    direction: "dong",
    legalStatus: "co-so-hong",
    nhaNguyenCanInfo: {
      khuLo: "",
      unitCode: "",
      propertyType: "nha-pho",
      totalFloors: 1,
      features: [],
      landArea: 0,
      usableArea: 0,
      width: 0,
      length: 0
    },
    utilities: {
      electricityPricePerKwh: 0,
      waterPrice: 0,
      waterBillingType: "per_person",
      internetFee: 0,
      garbageFee: 0,
      cleaningFee: 0,
      parkingMotorbikeFee: 0,
      parkingCarFee: 0,
      managementFee: 0,
      managementFeeUnit: "per_month",
      includedInRent: {
        electricity: false,
        water: false,
        internet: false,
        garbage: false,
        cleaning: false,
        parkingMotorbike: false,
        parkingCar: false,
        managementFee: false
      }
    },
    address: {
      street: building.address.street || "",
      ward: building.address.ward || "",
      city: building.address.city || "",
      provinceCode: building.address.provinceCode || "",
      provinceName: building.address.provinceName || "",
      wardCode: building.address.wardCode || "",
      wardName: building.address.wardName || "",
      specificAddress: building.address.specificAddress || (initialData?.address as Address)?.specificAddress || "",
      showSpecificAddress: (building.address as any).showSpecificAddress ?? (initialData?.address as any)?.showSpecificAddress ?? false,
      additionalInfo: building.address.additionalInfo || (initialData?.address as Address)?.additionalInfo || "",
    },
    maxOccupancy: 2,
    canShare: false,
    sharePrice: undefined,
    images: [],
    videos: [],
    description: "",
    ...initialData
  });

  const [nums, setNums] = useState({
    area: numberToDisplay(form.area) || String(form.area),
    price: numberToDisplay(form.price),
    deposit: numberToDisplay(form.deposit),
    maxOccupancy: numberToDisplay(form.maxOccupancy) || String(form.maxOccupancy),
    sharePrice: numberToDisplay(form.sharePrice),
    bedrooms: numberToDisplay(form.bedrooms) || String(form.bedrooms),
    bathrooms: numberToDisplay(form.bathrooms) || String(form.bathrooms),
    totalFloors: numberToDisplay(form.nhaNguyenCanInfo?.totalFloors) || String(form.nhaNguyenCanInfo?.totalFloors || 1),
    landArea: numberToDisplay(form.nhaNguyenCanInfo?.landArea) || String(form.nhaNguyenCanInfo?.landArea || 0),
    usableArea: numberToDisplay(form.nhaNguyenCanInfo?.usableArea) || String(form.nhaNguyenCanInfo?.usableArea || 0),
    width: numberToDisplay(form.nhaNguyenCanInfo?.width) || String(form.nhaNguyenCanInfo?.width || 0),
    length: numberToDisplay(form.nhaNguyenCanInfo?.length) || String(form.nhaNguyenCanInfo?.length || 0),
    electricityPricePerKwh: numberToDisplay(form.utilities?.electricityPricePerKwh),
    waterPrice: numberToDisplay(form.utilities?.waterPrice),
    internetFee: numberToDisplay(form.utilities?.internetFee),
    garbageFee: numberToDisplay(form.utilities?.garbageFee),
    cleaningFee: numberToDisplay(form.utilities?.cleaningFee),
    parkingMotorbikeFee: numberToDisplay(form.utilities?.parkingMotorbikeFee),
    parkingCarFee: numberToDisplay(form.utilities?.parkingCarFee),
    managementFee: numberToDisplay(form.utilities?.managementFee),
  });

  const setField = (key: keyof CreateRoomPayload, value: any) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  // Kiểm tra mã phòng trùng
  const checkRoomNumberDuplicate = (roomNumber: string) => {
    console.log("🔍 Checking room number:", roomNumber);
    console.log("📋 Existing rooms:", existingRooms);
    console.log("🆔 Initial data ID:", (initialData as any)?.id);
    
    if (!roomNumber.trim()) {
      setRoomNumberError("");
      return true;
    }
    
    const isDuplicate = existingRooms.some(room => {
      const isSameNumber = room.roomNumber.toLowerCase() === roomNumber.toLowerCase();
      const isNotCurrentRoom = room.id !== (initialData as any)?.id;
      console.log(`🔍 Room ${room.roomNumber} (ID: ${room.id}): same=${isSameNumber}, notCurrent=${isNotCurrentRoom}, duplicate=${isSameNumber && isNotCurrentRoom}`);
      return isSameNumber && isNotCurrentRoom;
    });
    
    console.log("❌ Is duplicate:", isDuplicate);
    
    if (isDuplicate) {
      setRoomNumberError("Mã phòng này đã tồn tại trong dãy");
      return false;
    } else {
      setRoomNumberError("");
      return true;
    }
  };

  const setNhaNguyenCan = (key: keyof NonNullable<CreateRoomPayload["nhaNguyenCanInfo"]>, value: any) => {
    setForm((p) => ({ 
      ...p, 
      nhaNguyenCanInfo: { 
        ...(p.nhaNguyenCanInfo || { 
          khuLo: "", 
          unitCode: "", 
          propertyType: "nha-pho", 
          totalFloors: 1, 
          features: [], 
          landArea: 0, 
          usableArea: 0, 
          width: 0, 
          length: 0 
        }), 
        [key]: value 
      } 
    }));
  };

  // Map includedInRent -> fee field
  const includedFeeMap: Record<string, keyof NonNullable<CreateRoomPayload["utilities"]>> = {
    electricity: "electricityPricePerKwh",
    water: "waterPrice",
    internet: "internetFee",
    garbage: "garbageFee",
    cleaning: "cleaningFee",
    parkingMotorbike: "parkingMotorbikeFee",
    parkingCar: "parkingCarFee",
    managementFee: "managementFee",
  };

  const handleIncludedChange = (
    key: keyof NonNullable<CreateRoomPayload["utilities"]>["includedInRent"],
    checked: boolean
  ) => {
    setForm((p) => {
      const next: CreateRoomPayload = {
        ...p,
        utilities: {
          ...(p.utilities || {}),
          includedInRent: {
            ...((p.utilities || {}).includedInRent || {}),
            [key]: checked,
          },
        },
      } as CreateRoomPayload;

      const feeField = includedFeeMap[key as string];
      if (feeField) {
        const feeVal = checked ? 0 : (next.utilities as any)[feeField] ?? 0;
        (next.utilities as any)[feeField] = feeVal;
        setNums((prev) => ({ ...prev, [feeField]: String(feeVal) }));
      }
      return next;
    });
  };

  const setNumDisp = (k: string, v: string) => setNums((p) => ({ ...p, [k]: stripLeadingZeros(v) }));

  const commitNum = (k: string, parse: (s: string) => number, min: number, setter: (n: number) => void) => {
    const v = parse(nums[k as keyof typeof nums] as string);
    const next = isNaN(v) ? min : Math.max(min, v);
    setter(next);
    setNumDisp(k, String(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Submitting form with room number:", form.roomNumber);
    
    // Kiểm tra mã phòng trùng trước khi submit
    const isValid = checkRoomNumberDuplicate(form.roomNumber);
    console.log("✅ Validation result:", isValid);
    
    if (!isValid) {
      console.log("❌ Form submission blocked due to duplicate room number");
      return;
    }
    
    try {
      setUploading(true);
      const uid = user?.userId;
      const imgUrls = mediaImages.length ? await uploadFiles(mediaImages.map((m) => m.file), uid as any) : [];
      const vidUrls = mediaVideos.length ? await uploadFiles(mediaVideos.map((m) => m.file), uid as any, "videos") : [];
      
      // Chuẩn hóa: dùng tầng từ nhà nguyên căn làm floor
      const floorFromNhaNguyenCan = form.nhaNguyenCanInfo?.totalFloors ?? form.floor;
      
      // Nếu includedInRent true thì đảm bảo phí = 0
      const normalizedUtilities = (() => {
        const u = { ...(form.utilities || {}) } as any;
        const inc = (u.includedInRent || {}) as Record<string, boolean>;
        Object.entries(includedFeeMap).forEach(([incKey, feeKey]) => {
          if (inc[incKey]) u[feeKey] = 0;
        });
        return u;
      })();
      
      const payload: CreateRoomPayload = {
        ...form,
        floor: floorFromNhaNguyenCan,
        images: [...(form.images || []), ...imgUrls],
        videos: [...(form.videos || []), ...vidUrls],
        nhaNguyenCanInfo: {
          khuLo: form.nhaNguyenCanInfo?.khuLo || "",
          unitCode: form.nhaNguyenCanInfo?.unitCode || "",
          propertyType: form.nhaNguyenCanInfo?.propertyType || "nha-pho",
          totalFloors: form.nhaNguyenCanInfo?.totalFloors || 1,
          landArea: form.nhaNguyenCanInfo?.landArea || 0,
          usableArea: form.nhaNguyenCanInfo?.usableArea || 0,
          width: form.nhaNguyenCanInfo?.width || 0,
          length: form.nhaNguyenCanInfo?.length || 0,
          features: form.nhaNguyenCanInfo?.features || [],
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          direction: form.direction,
          legalStatus: form.legalStatus
        },
        utilities: normalizedUtilities
      };
      
      onSubmit(payload);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header cố định */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nhà nguyên căn</h2>
            <p className="text-sm text-gray-500">{building?.name ? `Dãy: ${building.name}` : "Thêm mới phòng"}</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Đóng" className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:bg-gray-50">
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Media left */}
          <div className="lg:col-span-1 p-6 space-y-6 border-r border-gray-100 max-h-[70vh] overflow-y-auto pr-2 nice-scrollbar">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Ảnh</h3>
              <MediaPickerPanel mediaItems={mediaImages} onMediaChange={setMediaImages} maxImages={12} maxVideos={0} extraTop={
                form.images?.length ? (
                  <div className="mb-3 grid grid-cols-3 gap-3">
                    {form.images.map((u, i) => (
                      <div key={i} className="relative pb-[133%] rounded-2xl overflow-hidden border">
                        <img src={u} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null
              } />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Video</h3>
              <MediaPickerPanel accept="video/*" pillText="Video hợp lệ" mediaItems={mediaVideos} onMediaChange={setMediaVideos} maxImages={2} maxVideos={2} />
            </div>
          </div>

          {/* Fields right */}
          <div className="lg:col-span-2 p-6 space-y-10 max-h-[70vh] overflow-y-auto pr-2 nice-scrollbar">
            {/* Thông tin nhà nguyên căn */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Thông tin nhà nguyên căn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dãy</label>
                  <input className="w-full px-4 py-2 border rounded-lg bg-gray-50" value={building.name} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số phòng <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className={`w-full px-4 py-2 border rounded-lg ${roomNumberError ? 'border-red-500' : ''}`} 
                    value={form.roomNumber} 
                    onChange={(e) => { 
                      const v = e.target.value; 
                      setField("roomNumber", v);
                      setNhaNguyenCan("unitCode", v);
                      checkRoomNumberDuplicate(v);
                    }} 
                    onBlur={(e) => checkRoomNumberDuplicate(e.target.value)}
                    placeholder="A101" 
                  />
                  {roomNumberError && (
                    <p className="text-red-500 text-sm mt-1">{roomNumberError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khu/Lô <span className="text-red-500">*</span>
                  </label>
                  <input className="w-full px-4 py-2 border rounded-lg" value={form.nhaNguyenCanInfo?.khuLo || ""} onChange={(e) => setNhaNguyenCan("khuLo", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại nhà</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={form.nhaNguyenCanInfo?.propertyType || "nha-pho"} onChange={(e) => setNhaNguyenCan("propertyType", e.target.value)}>
                    <option value="nha-pho">Nhà phố</option>
                    <option value="biet-thu">Biệt thự</option>
                    <option value="nha-hem">Nhà hẻm</option>
                    <option value="nha-cap4">Nhà cấp 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tổng số tầng <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={1} className="w-full px-4 py-2 border rounded-lg" value={nums.totalFloors} onChange={(e) => setNumDisp("totalFloors", e.target.value)} onBlur={() => commitNum("totalFloors", (s) => parseInt(s, 10), 1, (n) => setNhaNguyenCan("totalFloors", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã căn <span className="text-red-500">*</span>
                  </label>
                  <input className="w-full px-4 py-2 border rounded-lg" value={form.nhaNguyenCanInfo?.unitCode || ""} onChange={(e) => setNhaNguyenCan("unitCode", e.target.value)} />
                </div>
                {/* Địa chỉ (gộp thành 1 input) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                  <input 
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50" 
                    value={`${building.address.specificAddress || ""} ${building.address.street || ""}, ${building.address.wardName || ""}, ${building.address.city || ""}`.trim()} 
                    disabled 
                  />
                </div>
              </div>
            </section>

            {/* Diện tích & bố cục */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Diện tích & bố cục</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích (m²) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={1} step="0.1" className="w-full px-4 py-2 border rounded-lg" value={nums.area} onChange={(e) => setNumDisp("area", e.target.value)} onBlur={() => commitNum("area", (s) => parseFloat(s), 1, (n) => setField("area", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội thất</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={form.furniture} onChange={(e) => setField("furniture", e.target.value as FurnitureType)}>
                    <option value="full">Đầy đủ</option>
                    <option value="co-ban">Cơ bản</option>
                    <option value="trong">Trống</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng ngủ <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={1} className="w-full px-4 py-2 border rounded-lg" value={nums.bedrooms} onChange={(e) => setNumDisp("bedrooms", e.target.value)} onBlur={() => commitNum("bedrooms", (s) => parseInt(s, 10), 1, (n) => setField("bedrooms", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng tắm <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={1} className="w-full px-4 py-2 border rounded-lg" value={nums.bathrooms} onChange={(e) => setNumDisp("bathrooms", e.target.value)} onBlur={() => commitNum("bathrooms", (s) => parseInt(s, 10), 1, (n) => setField("bathrooms", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hướng <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={form.direction} onChange={(e) => setField("direction", e.target.value as DirectionType)}>
                    <option value="dong">Đông</option>
                    <option value="tay">Tây</option>
                    <option value="nam">Nam</option>
                    <option value="bac">Bắc</option>
                    <option value="dong-bac">Đông Bắc</option>
                    <option value="dong-nam">Đông Nam</option>
                    <option value="tay-bac">Tây Bắc</option>
                    <option value="tay-nam">Tây Nam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pháp lý <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={form.legalStatus} onChange={(e) => setField("legalStatus", e.target.value as LegalStatusType)}>
                    <option value="co-so-hong">Có sổ hồng</option>
                    <option value="dang-ky">Đang đăng ký</option>
                    <option value="chua-dang-ky">Chưa đăng ký</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Diện tích đất */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Diện tích đất</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích đất (m²) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={1} step="0.1" className="w-full px-4 py-2 border rounded-lg" value={nums.landArea} onChange={(e) => setNumDisp("landArea", e.target.value)} onBlur={() => commitNum("landArea", (s) => parseFloat(s), 1, (n) => setNhaNguyenCan("landArea", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chiều ngang (m) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={0} step="0.1" className="w-full px-4 py-2 border rounded-lg" value={nums.width} onChange={(e) => setNumDisp("width", e.target.value)} onBlur={() => commitNum("width", (s) => parseFloat(s), 0, (n) => setNhaNguyenCan("width", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chiều dài (m) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={0} step="0.1" className="w-full px-4 py-2 border rounded-lg" value={nums.length} onChange={(e) => setNumDisp("length", e.target.value)} onBlur={() => commitNum("length", (s) => parseFloat(s), 0, (n) => setNhaNguyenCan("length", n))} />
                </div>
              </div>
            </section>

            {/* Đặc điểm nhà */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Đặc điểm nhà</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Hẻm xe hơi",
                  "Nhà nở hậu", 
                  "Mặt tiền rộng",
                  "Gần chợ",
                  "Gần trường học",
                  "Gần bệnh viện"
                ].map((feature) => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.nhaNguyenCanInfo?.features?.includes(feature) || false}
                      onChange={(e) => {
                        const currentFeatures = form.nhaNguyenCanInfo?.features || [];
                        const newFeatures = e.target.checked
                          ? [...currentFeatures, feature]
                          : currentFeatures.filter(f => f !== feature);
                        setNhaNguyenCan("features", newFeatures);
                      }}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Ở ghép */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Ở ghép</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cho phép ở ghép</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={form.canShare ? "true" : "false"} onChange={(e) => {
                    const canShare = e.target.value === "true";
                    setField("canShare", canShare);
                    // Reset maxOccupancy về 1 khi tắt ở ghép
                    if (!canShare) {
                      setField("maxOccupancy", 1);
                      setNumDisp("maxOccupancy", "1");
                    }
                  }}>
                    <option value="false">Không</option>
                    <option value="true">Có</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số người tối đa</label>
                  <input 
                    type="number" 
                    min={1} 
                    className={`w-full px-4 py-2 border rounded-lg ${!form.canShare ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={nums.maxOccupancy} 
                    onChange={(e) => setNumDisp("maxOccupancy", e.target.value)} 
                    onBlur={() => commitNum("maxOccupancy", (s) => parseInt(s, 10), 1, (n) => setField("maxOccupancy", n))}
                    disabled={!form.canShare}
                  />
                </div>

                {form.canShare && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giá mỗi người (đ)</label>
                      <input type="number" min={0} className="w-full px-4 py-2 border rounded-lg" value={nums.sharePrice} onChange={(e) => setNumDisp("sharePrice", e.target.value)} onBlur={() => commitNum("sharePrice", (s) => parseInt(s, 10), 0, (n) => setField("sharePrice", n))} />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Tiện ích & chi phí (bao gồm giá thuê) */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Tiện ích & chi phí</h3>
              
              {/* Mục bao gồm trong tiền thuê - đặt trước */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Mục bao gồm trong tiền thuê</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {[
                    { key: "electricity", label: "Điện" },
                    { key: "water", label: "Nước" },
                    { key: "internet", label: "Internet" },
                    { key: "garbage", label: "Rác" },
                    { key: "cleaning", label: "Vệ sinh" },
                    { key: "parkingMotorbike", label: "Giữ xe máy" },
                    { key: "parkingCar", label: "Giữ ô tô" },
                    { key: "managementFee", label: "Phí quản lý" },
                  ].map((it) => (
                    <label key={it.key} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(form.utilities?.includedInRent?.[it.key as keyof typeof form.utilities.includedInRent])}
                        onChange={(e) => handleIncludedChange(it.key as keyof NonNullable<CreateRoomPayload["utilities"]>["includedInRent"], e.target.checked)}
                      />
                      {it.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá thuê (đ/tháng) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={0} className="w-full px-4 py-2 border rounded-lg" value={nums.price} onChange={(e) => setNumDisp("price", e.target.value)} onBlur={() => commitNum("price", (s) => parseInt(s, 10), 0, (n) => setField("price", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền cọc (đ) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={0} className="w-full px-4 py-2 border rounded-lg" value={nums.deposit} onChange={(e) => setNumDisp("deposit", e.target.value)} onBlur={() => commitNum("deposit", (s) => parseInt(s, 10), 0, (n) => setField("deposit", n))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điện (đ/kWh)</label>
                  <input 
                    type="number" 
                    min={0} 
                    className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.electricity) ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={nums.electricityPricePerKwh} 
                    onChange={(e) => setNumDisp("electricityPricePerKwh", e.target.value)} 
                    onBlur={() => commitNum("electricityPricePerKwh", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), electricityPricePerKwh: n } })))} 
                    disabled={Boolean(form.utilities?.includedInRent?.electricity)}
                    placeholder={Boolean(form.utilities?.includedInRent?.electricity) ? "Miễn phí" : undefined}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nước (đ/đơn vị)</label>
                    <input 
                      type="number" 
                      min={0} 
                      className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.water) ? 'bg-gray-100 text-gray-500' : ''}`}
                      value={nums.waterPrice} 
                      onChange={(e) => setNumDisp("waterPrice", e.target.value)} 
                      onBlur={() => commitNum("waterPrice", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), waterPrice: n } })))} 
                      disabled={Boolean(form.utilities?.includedInRent?.water)}
                      placeholder={Boolean(form.utilities?.includedInRent?.water) ? "Miễn phí" : undefined}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cách tính nước</label>
                    <select 
                      className="w-full px-4 py-2 border rounded-lg" 
                      value={form.utilities?.waterBillingType || "per_person"} 
                      onChange={(e) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), waterBillingType: e.target.value as any } }))}
                    >
                      <option value="per_m3">Theo m³</option>
                      <option value="per_person">Theo đầu người</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internet (đ)</label>
                  <input 
                    type="number" 
                    min={0} 
                    className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.internet) ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={nums.internetFee} 
                    onChange={(e) => setNumDisp("internetFee", e.target.value)} 
                    onBlur={() => commitNum("internetFee", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), internetFee: n } })))} 
                    disabled={Boolean(form.utilities?.includedInRent?.internet)}
                    placeholder={Boolean(form.utilities?.includedInRent?.internet) ? "Miễn phí" : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rác (đ)</label>
                  <input 
                    type="number" 
                    min={0} 
                    className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.garbage) ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={nums.garbageFee} 
                    onChange={(e) => setNumDisp("garbageFee", e.target.value)} 
                    onBlur={() => commitNum("garbageFee", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), garbageFee: n } })))} 
                    disabled={Boolean(form.utilities?.includedInRent?.garbage)}
                    placeholder={Boolean(form.utilities?.includedInRent?.garbage) ? "Miễn phí" : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vệ sinh (đ)</label>
                  <input 
                    type="number" 
                    min={0} 
                    className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.cleaning) ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={nums.cleaningFee} 
                    onChange={(e) => setNumDisp("cleaningFee", e.target.value)} 
                    onBlur={() => commitNum("cleaningFee", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), cleaningFee: n } })))} 
                    disabled={Boolean(form.utilities?.includedInRent?.cleaning)}
                    placeholder={Boolean(form.utilities?.includedInRent?.cleaning) ? "Miễn phí" : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quản lý (đ)</label>
                  <input 
                    type="number" 
                    min={0} 
                    className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.managementFee) ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={nums.managementFee} 
                    onChange={(e) => setNumDisp("managementFee", e.target.value)} 
                    onBlur={() => commitNum("managementFee", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), managementFee: n } })))} 
                    disabled={Boolean(form.utilities?.includedInRent?.managementFee)}
                    placeholder={Boolean(form.utilities?.includedInRent?.managementFee) ? "Miễn phí" : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phí quản lý theo</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg" 
                    value={form.utilities?.managementFeeUnit || "per_month"} 
                    onChange={(e) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), managementFeeUnit: e.target.value as any } }))}
                  >
                    <option value="per_month">Theo tháng</option>
                    <option value="per_m2_per_month">Theo m²/tháng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giữ xe ô tô (đ)</label>
                  <input 
                    type="number" 
                    min={0} 
                    className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.parkingCar) ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={nums.parkingCarFee} 
                    onChange={(e) => setNumDisp("parkingCarFee", e.target.value)} 
                    onBlur={() => commitNum("parkingCarFee", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), parkingCarFee: n } })))} 
                    disabled={Boolean(form.utilities?.includedInRent?.parkingCar)}
                    placeholder={Boolean(form.utilities?.includedInRent?.parkingCar) ? "Miễn phí" : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giữ xe máy (đ)</label>
                  <input 
                    type="number" 
                    min={0} 
                    className={`w-full px-4 py-2 border rounded-lg ${Boolean(form.utilities?.includedInRent?.parkingMotorbike) ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={nums.parkingMotorbikeFee || ""} 
                    onChange={(e) => setNumDisp("parkingMotorbikeFee", e.target.value)} 
                    onBlur={() => commitNum("parkingMotorbikeFee", (s) => parseInt(s, 10), 0, (n) => setForm((p) => ({ ...p, utilities: { ...(p.utilities || {}), parkingMotorbikeFee: n } })))} 
                    disabled={Boolean(form.utilities?.includedInRent?.parkingMotorbike)}
                    placeholder={Boolean(form.utilities?.includedInRent?.parkingMotorbike) ? "Miễn phí" : undefined}
                  />
                </div>
              </div>
            </section>

            {/* Thông tin khác */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Thông tin khác</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea rows={4} className="w-full px-4 py-2 border rounded-lg" value={form.description} onChange={(e) => setField("description", e.target.value)} />
              </div>
            </section>

            {/* Note về form bắt buộc */}
            {!isFormValid() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <span className="font-medium">Lưu ý:</span> Vui lòng điền đầy đủ các trường có dấu <span className="text-red-500">*</span> trước khi xác nhận.
                </p>
              </div>
            )}

            {/* Hành động */}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onCancel} className="px-5 py-2 border rounded-lg">Hủy</button>
              <button 
                type="submit" 
                disabled={loading || uploading || !isFormValid()} 
                className="px-5 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || uploading ? "Đang lưu..." : "Lưu phòng"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Helper functions
function numberToDisplay(n: number | undefined): string {
  return n ? String(n) : "";
}

function stripLeadingZeros(s: string): string {
  return s.replace(/^0+/, "") || "0";
}

