"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createProfile, getMyProfile, updateMyProfile, UserProfile } from "@/services/userProfiles";
import AddressSelector from "@/components/common/AddressSelector";
import { addressService, type Address, type Ward } from "@/services/address";
import { uploadFiles } from "@/utils/upload";

export default function ProfileSurvey({ role }: { role: "user" | "landlord" }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<UserProfile>({});
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [preferredWards, setPreferredWards] = useState<string[]>([]);
  const [wardOptions, setWardOptions] = useState<Ward[]>([]);
  // Landlord target area
  const [landlordCity, setLandlordCity] = useState<Address | null>(null);
  const [landlordWardOptions, setLandlordWardOptions] = useState<Ward[]>([]);
  const [landlordTargetWards, setLandlordTargetWards] = useState<string[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ code: string; name: string }[]>([]);
  const [licensePreview, setLicensePreview] = useState<string>("");
  // UX helpers for required hints
  const [focusedField, setFocusedField] = useState<string>("");

  useEffect(() => {
    const fetch = async () => {
      if (!user?.userId) return;
      try {
        setLoading(true);
        const p = await getMyProfile(user.userId);
        setData(p || {});
        // Hydrate address line to UI (best effort)
        if (p?.currentLocation) setCurrentAddress({
          street: "",
          ward: p.currentLocation.split(",")[0] || "",
          city: p.currentLocation.split(",")[1]?.trim() || "",
          provinceCode: "", provinceName: "",
          wardCode: "", wardName: ""
        } as any);
        if (Array.isArray(p?.preferredDistricts)) setPreferredWards(p!.preferredDistricts!);
      } catch {
        setData({});
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.userId]);

  // Load ward options when city (provinceCode) changes, reset preferred wards if city changes
  useEffect(() => {
    const load = async () => {
      if (!currentAddress?.provinceCode) { setWardOptions([]); setPreferredWards([]); return; }
      try {
        const wards = await addressService.getWardsByProvince(currentAddress.provinceCode);
        setWardOptions(wards);
        // Filter preferredWards to still-valid ward names in this city
        setPreferredWards(prev => prev.filter(w => wards.some(opt => opt.wardName === w)));
      } catch {
        setWardOptions([]);
      }
    };
    load();
  }, [currentAddress?.provinceCode]);

  // Landlord wards list reacts to landlordCity
  useEffect(() => {
    const load = async () => {
      if (!landlordCity?.provinceCode) { setLandlordWardOptions([]); setLandlordTargetWards([]); return; }
      try {
        let code = String(landlordCity.provinceCode || "");
        let wards = await addressService.getWardsByProvince(code);
        if (!Array.isArray(wards) || wards.length === 0) {
          const padded = code.padStart(2, '0');
          if (padded !== code) {
            wards = await addressService.getWardsByProvince(padded);
          }
        }
        setLandlordWardOptions(wards);
        setLandlordTargetWards(prev => prev.filter(w => wards.some(opt => opt.wardName === w)));
      } catch {
        setLandlordWardOptions([]);
      }
    };
    load();
  }, [landlordCity?.provinceCode]);

  // Load provinces for landlord city select
  useEffect(() => {
    (async () => {
      try {
        const ps = await addressService.getProvinces();
        setProvinceOptions(ps.map(p => ({ code: p.provinceCode, name: p.provinceName })));
      } catch {
        setProvinceOptions([]);
      }
    })();
  }, []);

  const save = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const errs: string[] = [];
      // Common validations for both roles
      if (!currentAddress?.provinceCode || !currentAddress?.wardCode) {
        errs.push("Vui lòng chọn Tỉnh/Thành phố và Phường/Xã cho khu vực đang ở");
      }
      if (!Array.isArray(preferredWards) || preferredWards.length === 0) {
        errs.push("Vui lòng chọn ít nhất 1 phường ưu tiên");
      }
      if (!data.gender) errs.push("Vui lòng chọn giới tính");
      if (!data.occupation || !data.occupation.trim()) errs.push("Vui lòng nhập nghề nghiệp");
      if (data.income != null && data.income < 0) errs.push("Thu nhập không hợp lệ");
      if (data.budgetRange) {
        const { min, max } = data.budgetRange;
        if (min != null && min < 0) errs.push("Ngân sách tối thiểu không hợp lệ");
        if (max != null && max < 0) errs.push("Ngân sách tối đa không hợp lệ");
        if (min != null && max != null && min > max) errs.push("Ngân sách: tối thiểu phải nhỏ hơn hoặc bằng tối đa");
      }
      if (!Array.isArray(data.roomType) || data.roomType.length === 0) {
        errs.push("Vui lòng mô tả loại phòng/căn hộ quan tâm (đã hiểu được tối thiểu 1 loại)");
      }
      if (!Array.isArray(data.contactMethod) || data.contactMethod.length === 0) {
        errs.push("Vui lòng nhập ít nhất 1 cách liên hệ ưa thích");
      }

      // Landlord specific validations
      if (role === "landlord") {
        if (!data.businessType) errs.push("Vui lòng chọn loại hình kinh doanh");
        if (!data.experience) errs.push("Vui lòng chọn kinh nghiệm");
        if (data.propertiesCount != null && data.propertiesCount < 0) errs.push("Số bất động sản không hợp lệ");
        if (!Array.isArray(data.propertyTypes) || data.propertyTypes.length === 0) {
          errs.push("Vui lòng nhập loại BĐS cho thuê (tối thiểu 1 loại)");
        }
        if (!data.priceRange || data.priceRange.min == null || data.priceRange.max == null) {
          errs.push("Vui lòng nhập khoảng giá (tối thiểu và tối đa)");
        } else if (data.priceRange.min! > data.priceRange.max!) {
          errs.push("Khoảng giá: tối thiểu phải nhỏ hơn hoặc bằng tối đa");
        }
      }

      if (errs.length > 0) {
        setError(errs.join("\n"));
        setLoading(false);
        return;
      }
      const currentLocationText = currentAddress
        ? `${currentAddress.ward || currentAddress.wardName || ""}, ${currentAddress.city || currentAddress.provinceName || ""}`.replace(/^,\s*|\s*,\s*$/g, "")
        : data.currentLocation;

      const payload: UserProfile = {
        ...data,
        userId: user.userId,
        currentLocation: currentLocationText,
        preferredDistricts: preferredWards,
      };

      try {
        await createProfile(payload);
      } catch {
        await updateMyProfile(user.userId, payload);
      }
      window.location.href = "/";
    } catch (e: any) {
      setError(e?.body?.message || e?.message || "Lưu khảo sát thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-bold">Khảo sát hồ sơ ({role === "landlord" ? "Chủ nhà" : "Người dùng"})</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {role === "user" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thông tin cơ bản */}
          <div>
            <label className="text-sm font-medium">Tuổi</label>
            <input type="number" className="w-full border rounded-lg p-3" value={data.age ?? ""} onChange={e=>setData(d=>({...d, age: Number(e.target.value)}))} />
          </div>
          <div>
            <label className="text-sm font-medium">Giới tính</label>
            <select className="w-full border rounded-lg p-3" value={data.gender ?? "male"} onChange={e=>setData(d=>({...d, gender: e.target.value as any}))}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Nghề nghiệp</label>
            <input className="w-full border rounded-lg p-3" value={data.occupation ?? ""} onChange={e=>setData(d=>({...d, occupation: e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium">Thu nhập (ước tính)</label>
            <input type="number" className="w-full border rounded-lg p-3" value={data.income ?? ""} onChange={e=>setData(d=>({...d, income: Number(e.target.value)}))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Khu vực đang ở</label>
            <AddressSelector
              value={currentAddress}
              onChange={setCurrentAddress}
              fields={{ street: false, specificAddress: false, additionalInfo: false, preview: false }}
            />
          </div>
          {/* Sở thích & nhu cầu thuê */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Khu vực ưu tiên (chọn nhiều phường thuộc thành phố đã chọn)</label>
            <div className="max-h-56 overflow-auto border rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 gap-1">
              {wardOptions.map((opt) => {
                const checked = preferredWards.includes(opt.wardName);
                return (
                  <label key={opt.wardCode} className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      checked={checked}
                      onChange={(e) => {
                        setPreferredWards(prev => e.target.checked
                          ? Array.from(new Set([...prev, opt.wardName]))
                          : prev.filter(w => w !== opt.wardName)
                        );
                      }}
                    />
                    <span>{opt.wardName}</span>
                  </label>
                );
              })}
              {wardOptions.length === 0 && (
                <div className="text-gray-500 text-sm px-2">Chọn Tỉnh/Thành phố để hiện danh sách phường</div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Ngân sách tối thiểu</label>
            <input type="number" className="w-full border rounded-lg p-3" value={data.budgetRange?.min ?? ""} onChange={e=>setData(d=>({...d, budgetRange: { ...(d.budgetRange||{}), min: Number(e.target.value) }}))} />
          </div>
          <div>
            <label className="text-sm font-medium">Ngân sách tối đa</label>
            <input type="number" className="w-full border rounded-lg p-3" value={data.budgetRange?.max ?? ""} onChange={e=>setData(d=>({...d, budgetRange: { ...(d.budgetRange||{}), max: Number(e.target.value) }}))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Loại phòng/căn hộ quan tâm (nhập tự nhiên) <span className="text-red-500">*</span></label>
            <input className="w-full border rounded-lg p-3" placeholder="phòng trọ có gác, căn hộ studio, nhà nguyên căn..." onFocus={()=>setFocusedField("roomTypeHint")} onBlur={(e)=>{
              const txt = e.target.value.toLowerCase();
              const tokens: string[] = [];
              if (/phòng\s*trọ|trọ/.test(txt)) tokens.push("phong_tro");
              if (/chung\s*cư|căn\s*hộ|can\s*ho|studio|officetel/.test(txt)) tokens.push("chung_cu");
              if (/nhà\s*nguyên\s*căn|nha\s*nguyen\s*can|nhà\s*riêng/.test(txt)) tokens.push("nha_nguyen_can");
              setData(d=>({...d, roomType: Array.from(new Set(tokens)) }));
              setFocusedField("");
            }} />
            {focusedField === "roomTypeHint" && (
              <p className="text-xs text-gray-500 mt-1">Gợi ý: "phòng trọ", "căn hộ studio", "nhà nguyên căn"...</p>
            )}
            {Array.isArray(data.roomType) && data.roomType.length>0 && (
              <p className="text-xs text-gray-500 mt-1">Đã hiểu: {data.roomType.join(", ")}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Tiện ích ưu tiên</label>
            <input className="w-full border rounded-lg p-3" placeholder="wifi, parking, gym" value={(data.amenities || []).join(", ")} onChange={e=>setData(d=>({...d, amenities: e.target.value.split(",").map(s=>s.trim())}))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Phong cách sống</label>
            <select className="w-full border rounded-lg p-3" value={data.lifestyle ?? "quiet"} onChange={e=>setData(d=>({...d, lifestyle: e.target.value as any}))}>
              <option value="quiet">Yên tĩnh</option>
              <option value="social">Xã hội</option>
              <option value="party">Thích tiệc tùng</option>
              <option value="study">Học tập</option>
            </select>
          </div>
          {/* Roommate specific */}
          <div>
            <label className="text-sm font-medium">Hút thuốc?</label>
            <select className="w-full border rounded-lg p-3" value={String(data.smoking ?? false)} onChange={e=>setData(d=>({...d, smoking: e.target.value === "true"}))}>
              <option value="false">Không</option>
              <option value="true">Có</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Nuôi thú cưng?</label>
            <select className="w-full border rounded-lg p-3" value={String(data.pets ?? false)} onChange={e=>setData(d=>({...d, pets: e.target.value === "true"}))}>
              <option value="false">Không</option>
              <option value="true">Có</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Mức độ gọn gàng (1-5)</label>
            <input type="number" min={1} max={5} className="w-full border rounded-lg p-3" value={data.cleanliness ?? ""} onChange={e=>setData(d=>({...d, cleanliness: Number(e.target.value)}))} />
          </div>
          <div>
            <label className="text-sm font-medium">Mức độ hòa đồng (1-5)</label>
            <input type="number" min={1} max={5} className="w-full border rounded-lg p-3" value={data.socialLevel ?? ""} onChange={e=>setData(d=>({...d, socialLevel: Number(e.target.value)}))} />
          </div>
          {/* Thông tin liên hệ */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Cách liên hệ ưa thích</label>
            <input className="w-full border rounded-lg p-3" placeholder="email, phone, zalo" value={(data.contactMethod || []).join(", ")} onChange={e=>setData(d=>({...d, contactMethod: e.target.value.split(",").map(s=>s.trim())}))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Khung giờ liên hệ (ngày thường)</label>
            <input className="w-full border rounded-lg p-3" value={data.availableTime?.weekdays ?? ""} onChange={e=>setData(d=>({...d, availableTime: { ...(d.availableTime||{}), weekdays: e.target.value }}))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Khung giờ liên hệ (cuối tuần)</label>
            <input className="w-full border rounded-lg p-3" value={data.availableTime?.weekends ?? ""} onChange={e=>setData(d=>({...d, availableTime: { ...(d.availableTime||{}), weekends: e.target.value }}))} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business basics */}
          <div>
            <label className="text-sm font-medium">Loại hình kinh doanh <span className="text-red-500">*</span></label>
            <select className="w-full border rounded-lg p-3" value={data.businessType ?? "individual"} onChange={e=>setData(d=>({...d, businessType: e.target.value as any}))}>
              <option value="individual">Cá nhân</option>
              <option value="company">Công ty</option>
              <option value="agency">Môi giới</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Kinh nghiệm <span className="text-red-500">*</span></label>
            <select className="w-full border rounded-lg p-3" value={data.experience ?? "new"} onChange={e=>setData(d=>({...d, experience: e.target.value as any}))}>
              <option value="new">Mới</option>
              <option value="1-2_years">1-2 năm</option>
              <option value="3-5_years">3-5 năm</option>
              <option value="5+_years">5+ năm</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Số bất động sản</label>
            <input type="number" className="w-full border rounded-lg p-3" value={data.propertiesCount ?? ""} onChange={e=>setData(d=>({...d, propertiesCount: Number(e.target.value)}))} />
          </div>
          {/* Target area: select city + multi-wards */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Thành phố mục tiêu <span className="text-red-500">*</span></label>
            <select
              className="w-full border rounded-lg p-3"
              value={landlordCity?.provinceCode || ""}
              onChange={(e) => {
                const code = e.target.value;
                const name = provinceOptions.find(p=>p.code===code)?.name || "";
                setLandlordCity({
                  street: "",
                  ward: "",
                  city: name,
                  specificAddress: "",
                  provinceCode: code,
                  provinceName: name,
                  wardCode: "",
                  wardName: "",
                } as any);
              }}
            >
              <option value="">-- Chọn Tỉnh/Thành phố --</option>
              {provinceOptions.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Phường/Xã mục tiêu (nhiều) <span className="text-red-500">*</span></label>
            <div className="max-h-56 overflow-auto border rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 gap-1">
              {landlordWardOptions.map((opt) => {
                const checked = landlordTargetWards.includes(opt.wardName);
                return (
                  <label key={opt.wardCode} className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      checked={checked}
                      onChange={(e) => setLandlordTargetWards(prev => e.target.checked ? Array.from(new Set([...prev, opt.wardName])) : prev.filter(w => w !== opt.wardName))}
                    />
                    <span>{opt.wardName}</span>
                  </label>
                );
              })}
              {landlordWardOptions.length === 0 && (
                <div className="text-gray-500 text-sm px-2">Chọn Tỉnh/Thành phố để hiện danh sách phường</div>
              )}
            </div>
          </div>

          {/* Property types + price range */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Loại BĐS cho thuê <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { v: "phong_tro", t: "Phòng trọ" },
                { v: "chung_cu", t: "Chung cư/Căn hộ" },
                { v: "nha_nguyen_can", t: "Nhà nguyên căn" },
                { v: "can_ho_dv", t: "Căn hộ DV" },
                { v: "officetel", t: "Officetel" },
                { v: "studio", t: "Studio" },
              ].map(opt => {
                const checked = (data.propertyTypes||[]).includes(opt.v);
                return (
                  <label key={opt.v} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" checked={checked} onChange={(e)=>{
                      setData(d=>{
                        const set = new Set(d.propertyTypes||[]);
                        e.target.checked ? set.add(opt.v) : set.delete(opt.v);
                        return { ...d, propertyTypes: Array.from(set) };
                      });
                    }} />
                    <span>{opt.t}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Khoảng giá tối thiểu</label>
            <input type="number" className="w-full border rounded-lg p-3" value={data.priceRange?.min ?? ""} onChange={e=>setData(d=>({...d, priceRange: { ...(d.priceRange||{}), min: Number(e.target.value) }}))} />
          </div>
          <div>
            <label className="text-sm font-medium">Khoảng giá tối đa</label>
            <input type="number" className="w-full border rounded-lg p-3" value={data.priceRange?.max ?? ""} onChange={e=>setData(d=>({...d, priceRange: { ...(d.priceRange||{}), max: Number(e.target.value) }}))} />
          </div>

          {/* Target tenants + style */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Đối tượng khách thuê mục tiêu</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { v: "sinh_vien", t: "Sinh viên" },
                { v: "gia_dinh", t: "Gia đình" },
                { v: "nhan_vien_vp", t: "Nhân viên VP" },
                { v: "cap_doi", t: "Cặp đôi" },
                { v: "nhom_ban", t: "Nhóm bạn" },
              ].map(opt => {
                const checked = (data.targetTenants||[]).includes(opt.v);
                return (
                  <label key={opt.v} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" checked={checked} onChange={(e)=>{
                      setData(d=>{
                        const set = new Set(d.targetTenants||[]);
                        e.target.checked ? set.add(opt.v) : set.delete(opt.v);
                        return { ...d, targetTenants: Array.from(set) };
                      });
                    }} />
                    <span>{opt.t}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Phong cách quản lý</label>
            <select className="w-full border rounded-lg p-3" value={data.managementStyle ?? "friendly"} onChange={e=>setData(d=>({...d, managementStyle: e.target.value as any}))}>
              <option value="strict">Nghiêm</option>
              <option value="flexible">Linh hoạt</option>
              <option value="friendly">Thân thiện</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Thời gian phản hồi</label>
            <select className="w-full border rounded-lg p-3" value={data.responseTime ?? "within_day"} onChange={e=>setData(d=>({...d, responseTime: e.target.value as any}))}>
              <option value="immediate">Ngay lập tức</option>
              <option value="within_hour">Trong 1 giờ</option>
              <option value="within_day">Trong ngày</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Dịch vụ bổ sung</label>
            <input className="w-full border rounded-lg p-3" placeholder="vệ sinh, bảo trì, quản lý tòa nhà" value={(data.additionalServices || []).join(", ")} onChange={e=>setData(d=>({...d, additionalServices: e.target.value.split(",").map(s=>s.trim())}))} />
          </div>

          {/* Business docs */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="text-sm font-medium">Giấy phép kinh doanh (ảnh) <span className="text-red-500">*</span></label>
              <input type="file" accept="image/*" className="w-full border rounded-lg p-3" onChange={async (e)=>{
                const file = e.target.files?.[0];
                if (!file || !user?.userId) return;
                try {
                  setLoading(true);
                  // Preview ngay
                  const tmpUrl = URL.createObjectURL(file);
                  setLicensePreview(tmpUrl);
                  const [url] = await uploadFiles([file], String(user.userId), "licenses");
                  setData(d=>({ ...d, businessLicense: url }));
                } finally { setLoading(false); }
              }} />
              {(licensePreview || data.businessLicense) && (
                <div className="mt-2 p-2 border rounded-lg">
                  <img src={data.businessLicense || licensePreview} alt="Giấy phép" className="max-h-40 object-contain mx-auto" />
                </div>
              )}
            </div>
            {/* Bỏ nhóm ngân hàng ở cột phải để tránh trùng. Giữ nhóm phía dưới */}
            <div></div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Ngân hàng</label>
              <select className="w-full border rounded-lg p-3" value={data.bankAccount?.bankName ?? ""} onChange={e=>setData(d=>({...d, bankAccount: { ...(d.bankAccount||{}), bankName: e.target.value }}))}>
                <option value="">-- Chọn --</option>
                {[
                  "Vietcombank","VietinBank","BIDV","Agribank","Techcombank","MB Bank","ACB","Sacombank","VPBank","TPBank","HDBank","SHB","VIB"
                ].map(b => <option key={b} value={b}>{b}</option>)}
                <option value="Khác">Khác</option>
              </select>
              {data.bankAccount?.bankName === "Khác" && (
                <input className="mt-2 w-full border rounded-lg p-3" placeholder="Nhập tên ngân hàng" onChange={e=>setData(d=>({...d, bankAccount: { ...(d.bankAccount||{}), bankName: e.target.value }}))} />
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Số tài khoản</label>
              <input className="w-full border rounded-lg p-3" value={data.bankAccount?.accountNumber ?? ""} onChange={e=>setData(d=>({...d, bankAccount: { ...(d.bankAccount||{}), accountNumber: e.target.value }}))} />
            </div>
            <div>
              <label className="text-sm font-medium">Chủ tài khoản</label>
              <input className="w-full border rounded-lg p-3" value={data.bankAccount?.accountHolder ?? ""} onChange={e=>setData(d=>({...d, bankAccount: { ...(d.bankAccount||{}), accountHolder: e.target.value }}))} />
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Cách liên hệ ưa thích</label>
            <input className="w-full border rounded-lg p-3" placeholder="email, phone, zalo" value={(data.contactMethod || []).join(", ")} onChange={e=>setData(d=>({...d, contactMethod: e.target.value.split(",").map(s=>s.trim())}))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Khung giờ liên hệ (ngày thường)</label>
            <input className="w-full border rounded-lg p-3" value={data.availableTime?.weekdays ?? ""} onChange={e=>setData(d=>({...d, availableTime: { ...(d.availableTime||{}), weekdays: e.target.value }}))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Khung giờ liên hệ (cuối tuần)</label>
            <input className="w-full border rounded-lg p-3" value={data.availableTime?.weekends ?? ""} onChange={e=>setData(d=>({...d, availableTime: { ...(d.availableTime||{}), weekends: e.target.value }}))} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={save} disabled={loading} className="h-12 px-6 rounded-lg bg-teal-600 text-white">{loading ? "Đang lưu..." : "Hoàn tất"}</button>
      </div>
    </div>
  );
}


