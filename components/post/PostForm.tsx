"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import MediaPickerPanel, { LocalMediaItem } from "../common/MediaPickerLocal";
import { uploadFiles } from "@/utils/upload";
import { useAuth } from "@/contexts/AuthContext";

/** DANH MỤC */
export type CategoryId = "phong-tro" | "chung-cu" | "nha-nguyen-can";
const CATEGORIES = [
  { id: "phong-tro", label: "Phòng trọ" },
  { id: "chung-cu", label: "Căn hộ/Chung cư" },
  { id: "nha-nguyen-can", label: "Nhà nguyên căn" },
] as const;

/** Kiểu dữ liệu form - ĐÃ CẬP NHẬT ĐỂ KHỚP VỚI BACKEND API */
export type Address = {
  city: string;
  district: string;
  ward: string;
  street: string;
  houseNumber: string;
  showHouseNumber: boolean;
};

export type PhongTroData = {
  addr: Address | null;
  furniture: "" | "full" | "co-ban" | "trong"; // ✅ Đổi từ noiThat
  area: number; // ✅ Đổi từ string sang number
  price: number; // ✅ Đổi từ string sang number
  deposit: number; // ✅ Đổi từ string sang number
  title: string;
  desc: string;
};

export type ChungCuData = {
  buildingName: string;
  addr: Address | null;
  blockOrTower: string;
  floorNumber: number; // ✅ Đổi từ string sang number
  unitCode: string;
  propertyType: string; // ✅ Đổi từ loaiHinh
  bedrooms: number; // ✅ Đổi từ soPhongNgu
  bathrooms: number; // ✅ Đổi từ soVeSinh
  direction: string; // ✅ Đổi từ huong
  furniture: string; // ✅ Đổi từ noiThat
  legalStatus: string; // ✅ Đổi từ tinhTrangSo
  area: number; // ✅ Đổi từ string sang number
  price: number; // ✅ Đổi từ string sang number
  deposit: number; // ✅ Đổi từ string sang number
  title: string;
  desc: string;
};

export type NhaNguyenCanData = {
  addr: Address | null;
  khuLo: string;
  unitCode: string;
  propertyType: string; // ✅ Đổi từ loaiHinh
  bedrooms: number; // ✅ Đổi từ soPhongNgu
  bathrooms: number; // ✅ Đổi từ soVeSinh
  direction: string; // ✅ Đổi từ huong
  totalFloors: number; // ✅ Đổi từ tongSoTang
  furniture: string; // ✅ Đổi từ noiThat
  legalStatus: string; // ✅ Đổi từ tinhTrangSo
  landArea: number; // ✅ Đổi từ dtDat
  usableArea: number; // ✅ Đổi từ dtSuDung
  width: number; // ✅ Đổi từ ngang
  length: number; // ✅ Đổi từ dai
  price: number; // ✅ Đổi từ string sang number
  deposit: number; // ✅ Đổi từ string sang number
  title: string;
  desc: string;
  features: string[]; // ✅ Đổi từ featureSet
};

/** init - CẬP NHẬT VỚI KIỂU DỮ LIỆU MỚI */
const initPhongTro: PhongTroData = {
  addr: null,
  furniture: "",
  area: 0, // ✅ Đổi từ "" sang 0
  price: 0, // ✅ Đổi từ "" sang 0
  deposit: 0, // ✅ Đổi từ "" sang 0
  title: "",
  desc: "",
};

const initChungCu: ChungCuData = {
  buildingName: "",
  addr: null,
  blockOrTower: "",
  floorNumber: 0, // ✅ Đổi từ "" sang 0
  unitCode: "",
  propertyType: "", // ✅ Đổi từ loaiHinh
  bedrooms: 0, // ✅ Đổi từ soPhongNgu
  bathrooms: 0, // ✅ Đổi từ soVeSinh
  direction: "", // ✅ Đổi từ huong
  furniture: "", // ✅ Đổi từ noiThat
  legalStatus: "", // ✅ Đổi từ tinhTrangSo
  area: 0, // ✅ Đổi từ "" sang 0
  price: 0, // ✅ Đổi từ "" sang 0
  deposit: 0, // ✅ Đổi từ "" sang 0
  title: "",
  desc: "",
};

const initNNC: NhaNguyenCanData = {
  addr: null,
  khuLo: "",
  unitCode: "",
  propertyType: "", // ✅ Đổi từ loaiHinh
  bedrooms: 0, // ✅ Đổi từ soPhongNgu
  bathrooms: 0, // ✅ Đổi từ soVeSinh
  direction: "", // ✅ Đổi từ huong
  totalFloors: 0, // ✅ Đổi từ tongSoTang
  furniture: "", // ✅ Đổi từ noiThat
  legalStatus: "", // ✅ Đổi từ tinhTrangSo
  landArea: 0, // ✅ Đổi từ dtDat
  usableArea: 0, // ✅ Đổi từ dtSuDung
  width: 0, // ✅ Đổi từ ngang
  length: 0, // ✅ Đổi từ dai
  price: 0, // ✅ Đổi từ "" sang 0
  deposit: 0, // ✅ Đổi từ "" sang 0
  title: "",
  desc: "",
  features: [], // ✅ Đổi từ featureSet
};

/** Lazy load form con */
const PhongTroForm = dynamic(() => import("./forms/phongtro"));
const ChungCuForm = dynamic(() => import("./forms/chungcu"));
const NhaNguyenCanForm = dynamic(() => import("./forms/nhanguyencan"));

/* Modal chọn danh mục */
function CategoryModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (c: CategoryId) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl">
          <div className="px-5 py-3 border-b text-center font-semibold">
            Chọn danh mục
          </div>
          <div className="p-4 space-y-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id as CategoryId)}
                className="w-full flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-gray-50"
              >
                <span className="font-medium">{c.label}</span>
                <span>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Modal Quy định */
function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl">
          <div className="px-5 py-3 border-b text-center font-semibold">
            Quy định
          </div>
          <div className="p-5 text-sm text-gray-700 leading-6">
            Nội dung quy định sẽ bổ sung sau.
          </div>
          <div className="px-5 pb-4">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-lg bg-teal-500 text-white w-full"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostForm() {
  const [category, setCategory] = useState<CategoryId | "">("");
  const [showCateModal, setShowCateModal] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // upload
  const [images, setImages] = useState<LocalMediaItem[]>([]);
  const [videos, setVideos] = useState<LocalMediaItem[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  // STATE CHO 3 FORM
  const [phongtroData, setPhongtroData] = useState<PhongTroData>(initPhongTro);
  const [chungcuData, setChungcuData] = useState<ChungCuData>(initChungCu);
  const [nncData, setNncData] = useState<NhaNguyenCanData>(initNNC);

  // Auth context
  const { user } = useAuth();
  // khởi tạo category
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const fromUrl = p.get("category") as CategoryId | null;
    const saved = localStorage.getItem("post_category") as CategoryId | null;
    const ids = CATEGORIES.map((c) => c.id);
    const initial =
      fromUrl && ids.includes(fromUrl)
        ? fromUrl
        : saved && ids.includes(saved)
        ? saved
        : "";
    setCategory(initial);
    setShowCateModal(!initial);
  }, []);
  useEffect(() => {
    if (!category) return;
    localStorage.setItem("post_category", category);
    const url = new URL(location.href);
    url.searchParams.set("category", category);
    history.replaceState({}, "", url.toString());
  }, [category]);

  // CHỌN FORM & PROPS
  const ActiveForm = useMemo(() => {
    switch (category) {
      case "phong-tro":
        return PhongTroForm as any;
      case "chung-cu":
        return ChungCuForm as any;
      case "nha-nguyen-can":
        return NhaNguyenCanForm as any;
      default:
        return null;
    }
  }, [category]);

  const activeProps = useMemo(() => {
    switch (category) {
      case "phong-tro":
        return { data: phongtroData, setData: setPhongtroData };
      case "chung-cu":
        return { data: chungcuData, setData: setChungcuData };
      case "nha-nguyen-can":
        return { data: nncData, setData: setNncData };
      default:
        return {};
    }
  }, [category, phongtroData, chungcuData, nncData]);

  // SUBMIT CHỈ LẤY FORM ĐANG ACTIVE - CẬP NHẬT ĐỂ GỬI ĐÚNG FORMAT CHO API
  const handleSubmit = async () => {
    if (!category) return;

    if (!user) {
      alert("Bạn cần đăng nhập trước khi đăng tin");
      return;
    }

    const userId = user.userId; // ✅ lấy từ context

    // 1. Upload trước
    const imageUrls = await uploadFiles(
      images.map((i) => i.file),
      String(userId),
      "images"
    );
    const videoUrls = await uploadFiles(
      videos.map((v) => v.file),
      String(userId),
      "videos"
    );

    const basePayload = {
      userId,
      images: imageUrls,
      videos: videoUrls,
      status: "active",
    };

    let payload: any = {};

    if (category === "phong-tro") {
      if (!phongtroData.addr) {
        alert("Vui lòng chọn địa chỉ");
        return;
      }
      payload = {
        ...basePayload,
        title: phongtroData.title,
        description: phongtroData.desc,
        address: phongtroData.addr,
        area: phongtroData.area,
        price: phongtroData.price,
        deposit: phongtroData.deposit,
        furniture: phongtroData.furniture,
      };
    }

    if (category === "chung-cu") {
      if (!chungcuData.addr) {
        alert("Vui lòng chọn địa chỉ");
        return;
      }
      payload = {
        ...basePayload,
        title: chungcuData.title,
        description: chungcuData.desc,
        address: chungcuData.addr,
        buildingInfo: {
          buildingName: chungcuData.buildingName,
          blockOrTower: chungcuData.blockOrTower,
          floorNumber: chungcuData.floorNumber,
          unitCode: chungcuData.unitCode,
        },
        area: chungcuData.area,
        price: chungcuData.price,
        deposit: chungcuData.deposit,
        furniture: chungcuData.furniture,
        bedrooms: chungcuData.bedrooms,
        bathrooms: chungcuData.bathrooms,
        direction: chungcuData.direction,
        propertyType: chungcuData.propertyType,
        legalStatus: chungcuData.legalStatus,
      };
    }

    if (category === "nha-nguyen-can") {
      if (!nncData.addr) {
        alert("Vui lòng chọn địa chỉ");
        return;
      }
      payload = {
        ...basePayload,
        title: nncData.title,
        description: nncData.desc,
        address: nncData.addr,
        propertyInfo: {
          khuLo: nncData.khuLo,
          unitCode: nncData.unitCode,
          propertyType: nncData.propertyType,
          totalFloors: nncData.totalFloors,
          features: nncData.features,
        },
        landArea: nncData.landArea,
        usableArea: nncData.usableArea,
        width: nncData.width,
        length: nncData.length,
        price: nncData.price,
        deposit: nncData.deposit,
        furniture: nncData.furniture,
        bedrooms: nncData.bedrooms,
        bathrooms: nncData.bathrooms,
        direction: nncData.direction,
        legalStatus: nncData.legalStatus,
      };
    }

    try {
      console.log("SUBMIT PAYLOAD:", payload);

      // TODO: Uncomment khi đã có API endpoint
      // const response = await fetch(`/api/rent-posts/${category}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getToken()}` // Lấy từ auth context
      //   },
      //   body: JSON.stringify(payload)
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to create post');
      // }

      // const result = await response.json();
      // console.log('Post created successfully:', result);

      alert(`Submit ${category} thành công!`);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Có lỗi xảy ra khi tạo bài đăng");
    }
  };

  // CLEAR chỉ form đang active
  const handleClear = () => {
    if (category === "phong-tro") setPhongtroData(initPhongTro);
    if (category === "chung-cu") setChungcuData(initChungCu);
    if (category === "nha-nguyen-can") setNncData(initNNC);
    setImages([]);
    setVideos([]);
  };

  const handleUploadImages = async () => {
    const urls = await uploadFiles(
      images.map((i) => i.file),
      "1",
      "images"
    );
    setImageUrls(urls);
  };

  const handleUploadVideos = async () => {
    const urls = await uploadFiles(
      videos.map((v) => v.file),
      "1",
      "videos"
    );
    setVideoUrls(urls);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
      <CategoryModal
        open={showCateModal}
        onClose={() => setShowCateModal(false)}
        onSelect={(c) => {
          setCategory(c);
          setShowCateModal(false);
        }}
      />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />

      {/* Hình ảnh + Form */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">
            Hình ảnh và Video sản phẩm
          </h2>
          <button
            onClick={() => setShowRules(true)}
            className="text-[13px] text-sky-600 hover:underline"
          >
            Quy định đăng tin
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: Upload */}
          <aside className="md:col-span-5 space-y-4">
            <MediaPickerPanel
              pillText="Hình ảnh hợp lệ"
              helper="BẮT BUỘC ĐĂNG TỪ 03 ĐẾN 12 HÌNH"
              accept="image/*"
              max={12}
              value={images}
              onChange={setImages}
              guideTitle="Hình ảnh hợp lệ – Yêu cầu"
              guideItems={[
                "Tối thiểu 3 ảnh, tối đa 12 ảnh.",
                "Ưu tiên chụp thật, rõ nét, nội dung đúng sản phẩm.",
                "Không mờ/nhòe, không dán số điện thoại to trên ảnh.",
              ]}
            />

            <MediaPickerPanel
              pillText="Video hợp lệ"
              helper="Đăng video để bán nhanh hơn"
              accept="video/*"
              max={2}
              value={videos}
              onChange={setVideos}
              guideTitle="Video hợp lệ – Yêu cầu"
              guideItems={[
                "Tối đa 2 video, ≤ 60s/video.",
                "mp4/mov/webm; dung lượng ≤ 100MB.",
                "Góc quay sáng, rõ ràng, không nội dung nhạy cảm.",
              ]}
            />
          </aside>
          {/* RIGHT: Danh mục + Form con */}
          <section className="md:col-span-7">
            <div className="mb-5">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Danh mục Tin Đăng *
              </div>
              <button
                type="button"
                onClick={() => setShowCateModal(true)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 text-left bg-white hover:bg-gray-50"
              >
                {category
                  ? CATEGORIES.find((c) => c.id === category)?.label
                  : "Chọn danh mục"}
                <span className="float-right opacity-60">▾</span>
              </button>
            </div>

            {ActiveForm ? (
              <ActiveForm {...(activeProps as any)} />
            ) : (
              <div className="text-gray-500 text-center py-16 border rounded-2xl">
                Chọn danh mục để bắt đầu.
              </div>
            )}

            {/* NÚT Clear + Đăng tin (nằm ở parent) */}
            {category && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handleClear}
                  className="h-11 px-4 rounded-xl border border-gray-300 hover:bg-gray-50"
                >
                  Clear form này
                </button>
                <button
                  onClick={handleSubmit}
                  className="h-11 px-5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600"
                >
                  Đăng tin
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
