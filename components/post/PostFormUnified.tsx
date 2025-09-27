"use client";

import React, { useState, useEffect } from "react";
import { PostType, CreatePostPayload, PersonalInfo, Requirements } from "@/types/Post";
import { RoomForPost } from "@/types/Post";
import { createPost } from "@/services/posts";
// Removed unused imports for media upload
import { extractApiErrorMessage } from "@/utils/api";
import { useNotification } from "@/hooks/useNotification";
import { addressService } from "@/services/address";
import { useAuth } from "@/contexts/AuthContext";

// Sử dụng RoomForPost type từ types/Post.ts

interface PostFormUnifiedProps {
  postType: PostType;
  selectedRoom: RoomForPost;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PostFormUnified({ postType, selectedRoom, onBack, onSuccess }: PostFormUnifiedProps) {
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<CreatePostPayload>>({
    postType: postType,
    roomId: selectedRoom.roomId,
    title: "",
    personalInfo: {
      fullName: "",
      age: 0,
      dateOfBirth: "",
      gender: "male",
      occupation: "",
      hobbies: [],
      habits: [],
      lifestyle: "normal",
      cleanliness: "normal",
    },
    requirements: {
      ageRange: [0, 0],
      gender: "male",
      traits: [],
      maxPrice: 0,
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      postType: postType,
      roomId: selectedRoom.roomId,
      // Reset personalInfo/requirements if switching postType
      personalInfo: postType === "roommate" ? prev.personalInfo : undefined,
      requirements: postType === "roommate" ? prev.requirements : undefined,
    }));
  }, [postType, selectedRoom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handlePersonalInfoChange = (name: keyof PersonalInfo, value: any) => {
    setFormData((prev) => {
      const newPersonalInfo = {
        ...prev.personalInfo,
        [name]: value,
      } as PersonalInfo;

      // Calculate dateOfBirth when age changes
      if (name === 'age' && typeof value === 'number' && value > 0) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - value;
        const dateOfBirth = `${birthYear}-01-01T00:00:00.000Z`; // ISO 8601 format
        newPersonalInfo.dateOfBirth = dateOfBirth;
      }

      return {
        ...prev,
        personalInfo: newPersonalInfo,
      };
    });
  };

  const handleRequirementsChange = (name: keyof Requirements, value: any) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [name]: value,
      } as Requirements,
    }));
  };

  const handleAgeRangeChange = (index: 0 | 1, value: string) => {
    const newAgeRange = [...(formData.requirements?.ageRange || [0, 0])] as [number, number];
    newAgeRange[index] = Number(value);
    handleRequirementsChange("ageRange", newAgeRange);
  };

  const handleMultiSelectChange = (name: "hobbies" | "habits" | "traits", value: string[]) => {
    if (name === "hobbies" || name === "habits") {
      handlePersonalInfoChange(name, value);
    } else if (name === "traits") {
      handleRequirementsChange(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log user info
    console.log('User info before validation:', user);
    
    // Kiểm tra thông tin liên hệ
    if (!user?.email) {
      console.log('Missing email');
      showError("Lỗi", "Không tìm thấy thông tin email. Vui lòng đăng nhập lại.");
      return;
    }
    
    if (!user?.phone) {
      console.log('Missing phone');
      showError("Lỗi", "Không tìm thấy thông tin số điện thoại. Vui lòng cập nhật thông tin cá nhân.");
      return;
    }
    
    console.log('Validation passed, proceeding to submit...');
    
    setLoading(true);
    
    try {
      console.log('Starting submit process...');
      const userId = user?.userId;

      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      console.log('UserId found:', userId);

      // Validate roomId
      if (!formData.roomId || formData.roomId <= 0) {
        throw new Error('Vui lòng chọn phòng hợp lệ');
      }
      console.log('RoomId validated:', formData.roomId);

      // Validate required fields
      if (!formData.title?.trim()) {
        throw new Error('Vui lòng nhập tiêu đề bài đăng');
      }
      console.log('Title validated:', formData.title);

      // Skip roommate validation since we only use rent posts

      // Không cần upload media vì sử dụng từ room

      // Map postType to backend format
      const backendPostType = formData.postType === 'rent' ? 'cho-thue' : 'tim-o-ghep';
      
      // Sử dụng thông tin từ room và user thay vì form
      const payload: CreatePostPayload = {
        postType: backendPostType as any, // Cast to satisfy TypeScript
        roomId: formData.roomId!,
        title: formData.title!.trim(),
        description: selectedRoom.description || '', // Lấy mô tả từ room
        images: selectedRoom.images || [], // Lấy hình ảnh từ room
        videos: selectedRoom.videos || [], // Lấy video từ room
        phone: user?.phone!, // Lấy số điện thoại từ user (đã validate ở trên)
        email: user?.email!, // Lấy email từ user (đã validate ở trên)
      };

      // Debug log để kiểm tra payload
      console.log('Payload to submit:', payload);
      console.log('User info:', user);

      if (postType === "roommate") {
        // Ensure personalInfo is properly formatted
        if (formData.personalInfo) {
          // Calculate dateOfBirth if not already set
          let dateOfBirth = formData.personalInfo.dateOfBirth;
          if (!dateOfBirth && formData.personalInfo.age > 0) {
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - formData.personalInfo.age;
            dateOfBirth = `${birthYear}-01-01T00:00:00.000Z`;
          }

          payload.personalInfo = {
            fullName: formData.personalInfo.fullName?.trim() || "",
            age: Number(formData.personalInfo.age) || 0,
            dateOfBirth: dateOfBirth || `${new Date().getFullYear() - 25}-01-01T00:00:00.000Z`, // Default to 25 years old
            gender: formData.personalInfo.gender || "male",
            occupation: formData.personalInfo.occupation?.trim() || "",
            hobbies: Array.isArray(formData.personalInfo.hobbies) ? formData.personalInfo.hobbies : [],
            habits: Array.isArray(formData.personalInfo.habits) ? formData.personalInfo.habits : [],
            lifestyle: formData.personalInfo.lifestyle || "normal",
            cleanliness: formData.personalInfo.cleanliness || "normal"
          };
        }
        
        // Ensure requirements is properly formatted
        if (formData.requirements) {
          payload.requirements = {
            ageRange: Array.isArray(formData.requirements.ageRange) ? formData.requirements.ageRange : [0, 0],
            gender: formData.requirements.gender || "any",
            traits: Array.isArray(formData.requirements.traits) ? formData.requirements.traits : [],
            maxPrice: Number(formData.requirements.maxPrice) || 0
          };
        }
      }

      // Clean up payload - remove undefined/null values
      const cleanPayload = JSON.parse(JSON.stringify(payload, (key, value) => {
        if (value === null || value === undefined) {
          return undefined; // Remove null/undefined values
        }
        return value;
      }));

      console.log('About to call createPost with payload:', cleanPayload);
      
      const result = await createPost(cleanPayload);
      console.log('Create post result:', result);
      
      showSuccess("Thành công", "Đăng bài thành công!");
      onSuccess();
    } catch (err: any) {
      const errorMessage = extractApiErrorMessage(err);
      showError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const commonFormFields = (
    <>
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề bài đăng <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
          placeholder="Ví dụ: Cho thuê phòng trọ giá rẻ, gần trường học"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Hình ảnh, mô tả chi tiết và thông tin liên hệ sẽ được lấy từ thông tin phòng đã có
        </p>
      </div>
    </>
  );

  const roommateSpecificFields = (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cá nhân của bạn</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.personalInfo?.fullName || ""}
            onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Tuổi <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.personalInfo?.age || ""}
            onChange={(e) => handlePersonalInfoChange("age", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.personalInfo?.gender || "any"}
            onChange={(e) => handlePersonalInfoChange("gender", e.target.value as "male" | "female" | "other")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="any">Không yêu cầu</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
            Nghề nghiệp
          </label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.personalInfo?.occupation || ""}
            onChange={(e) => handlePersonalInfoChange("occupation", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700 mb-1">
          Sở thích (chọn nhiều)
        </label>
        <select
          id="hobbies"
          name="hobbies"
          multiple
          value={formData.personalInfo?.hobbies || []}
          onChange={(e) =>
            handleMultiSelectChange(
              "hobbies",
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-24"
        >
          <option value="đọc sách">Đọc sách</option>
          <option value="xem phim">Xem phim</option>
          <option value="nghe nhạc">Nghe nhạc</option>
          <option value="chơi game">Chơi game</option>
          <option value="thể thao">Thể thao</option>
          <option value="nấu ăn">Nấu ăn</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="habits" className="block text-sm font-medium text-gray-700 mb-1">
          Thói quen (chọn nhiều)
        </label>
        <select
          id="habits"
          name="habits"
          multiple
          value={formData.personalInfo?.habits || []}
          onChange={(e) =>
            handleMultiSelectChange(
              "habits",
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-24"
        >
          <option value="dậy sớm">Dậy sớm</option>
          <option value="ngủ muộn">Ngủ muộn</option>
          <option value="tập thể dục">Tập thể dục</option>
          <option value="hút thuốc">Hút thuốc</option>
          <option value="uống rượu">Uống rượu</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="lifestyle" className="block text-sm font-medium text-gray-700 mb-1">
            Lối sống
          </label>
          <select
            id="lifestyle"
            name="lifestyle"
            value={formData.personalInfo?.lifestyle || "normal"}
            onChange={(e) => handlePersonalInfoChange("lifestyle", e.target.value as "early" | "normal" | "late")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="early">Dậy sớm</option>
            <option value="normal">Bình thường</option>
            <option value="late">Ngủ muộn</option>
          </select>
        </div>
        <div>
          <label htmlFor="cleanliness" className="block text-sm font-medium text-gray-700 mb-1">
            Mức độ sạch sẽ
          </label>
          <select
            id="cleanliness"
            name="cleanliness"
            value={formData.personalInfo?.cleanliness || "normal"}
            onChange={(e) => handlePersonalInfoChange("cleanliness", e.target.value as "very_clean" | "clean" | "normal" | "flexible")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="very_clean">Rất sạch sẽ</option>
            <option value="clean">Sạch sẽ</option>
            <option value="normal">Bình thường</option>
            <option value="flexible">Linh hoạt</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu đối với người ở ghép</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="ageRangeMin" className="block text-sm font-medium text-gray-700 mb-1">
            Độ tuổi từ
          </label>
          <input
            type="number"
            id="ageRangeMin"
            name="ageRangeMin"
            value={formData.requirements?.ageRange?.[0] || ""}
            onChange={(e) => handleAgeRangeChange(0, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label htmlFor="ageRangeMax" className="block text-sm font-medium text-gray-700 mb-1">
            Đến
          </label>
          <input
            type="number"
            id="ageRangeMax"
            name="ageRangeMax"
            value={formData.requirements?.ageRange?.[1] || ""}
            onChange={(e) => handleAgeRangeChange(1, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label htmlFor="preferredGender" className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính ưu tiên
          </label>
          <select
            id="preferredGender"
            name="preferredGender"
            value={formData.requirements?.gender || "any"}
            onChange={(e) => handleRequirementsChange("gender", e.target.value as "male" | "female" | "any")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="any">Không yêu cầu</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Giá thuê tối đa (đ/tháng)
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={formData.requirements?.maxPrice || ""}
            onChange={(e) => handleRequirementsChange("maxPrice", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="traits" className="block text-sm font-medium text-gray-700 mb-1">
          Đặc điểm mong muốn (chọn nhiều)
        </label>
        <select
          id="traits"
          name="traits"
          multiple
          value={formData.requirements?.traits || []}
          onChange={(e) =>
            handleMultiSelectChange(
              "traits",
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-24"
        >
          <option value="sạch sẽ">Sạch sẽ</option>
          <option value="yên tĩnh">Yên tĩnh</option>
          <option value="hòa đồng">Hòa đồng</option>
          <option value="ít nói">Ít nói</option>
          <option value="thân thiện">Thân thiện</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Quay lại"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          Đăng bài {postType === "rent" ? "cho thuê" : "tìm ở ghép"}
        </h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-blue-700 text-sm font-medium mb-1">
              Bạn đang đăng bài cho phòng: <span className="font-semibold">Phòng {selectedRoom.roomNumber}</span>
            </p>
            <p className="text-blue-600 text-sm">
              Tại: {selectedRoom.buildingName ? `${selectedRoom.buildingName} - ` : ''}
              {selectedRoom.address ? `${selectedRoom.address.street}, ${selectedRoom.address.ward}, ${selectedRoom.address.city}` : 'Địa chỉ không xác định'}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Hình ảnh, mô tả, thông tin liên hệ và tất cả thông tin chi tiết sẽ được lấy từ thông tin phòng đã có
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {commonFormFields}
        {postType === "roommate" && roommateSpecificFields}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang đăng...
              </div>
            ) : (
              "Đăng bài"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}