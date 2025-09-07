"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/common/Footer";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileForm from "../../components/profile/ProfileForm";
import AccountSettings from "../../components/profile/AccountSettings";
import { VerificationData } from "../../components/profile/VerificationModal";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Trạng thái xác thực
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Tạo URL tạm thời để preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        avatar: imageUrl
      }));
    }
  };

  const handleSave = () => {
    // TODO: Gọi API cập nhật thông tin
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatar: user?.avatar || "",
    });
    setIsEditing(false);
  };

  const handleVerificationComplete = (data: VerificationData) => {
    // TODO: Gọi API lưu thông tin xác thực
    console.log("Verification completed:", data);
    setIsVerified(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <ProfileHeader 
            user={formData}
            isEditing={isEditing}
            onEditClick={() => setIsEditing(true)}
          />
          
          <ProfileForm
            formData={formData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onAvatarChange={handleAvatarChange}
            onSave={handleSave}
            onCancel={handleCancel}
            onEditClick={() => setIsEditing(true)}
          />
          
          <AccountSettings 
            isVerified={isVerified}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
