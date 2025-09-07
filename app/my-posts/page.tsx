"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/common/Footer";
import MyPostsContent from "../../components/my-posts/MyPostsContent";

// Mock data cho bài đăng
const mockPosts = [
  {
    id: 1,
    title: "Phòng trọ đẹp gần trường ĐH Bách Khoa",
    category: "phong-tro",
    price: 2500000,
    area: 25,
    address: "Quận 10, TP.HCM",
    status: "active",
    views: 156,
    createdAt: "2024-01-15",
    images: ["/home/room1.png", "/home/room2.png"],
  },
  {
    id: 2,
    title: "Căn hộ chung cư 2PN 2WC tại Quận 7",
    category: "chung-cu",
    price: 8000000,
    area: 65,
    address: "Quận 7, TP.HCM",
    status: "pending",
    views: 89,
    createdAt: "2024-01-10",
    images: ["/home/room3.png"],
  },
  {
    id: 3,
    title: "Nhà nguyên căn 3 tầng tại Quận 2",
    category: "nha-nguyen-can",
    price: 15000000,
    area: 120,
    address: "Quận 2, TP.HCM",
    status: "inactive",
    views: 234,
    createdAt: "2024-01-05",
    images: ["/home/room4.png"],
  },
  {
    id: 4,
    title: "Phòng trọ giá rẻ gần chợ Bến Thành",
    category: "phong-tro",
    price: 1800000,
    area: 20,
    address: "Quận 1, TP.HCM",
    status: "active",
    views: 78,
    createdAt: "2024-01-20",
    images: ["/home/room1.png"],
  },
  {
    id: 5,
    title: "Căn hộ cao cấp view sông tại Quận 4",
    category: "chung-cu",
    price: 12000000,
    area: 85,
    address: "Quận 4, TP.HCM",
    status: "active",
    views: 312,
    createdAt: "2024-01-18",
    images: ["/home/room2.png"],
  },
  {
    id: 6,
    title: "Nhà phố 2 tầng tại Quận 3",
    category: "nha-nguyen-can",
    price: 20000000,
    area: 150,
    address: "Quận 3, TP.HCM",
    status: "pending",
    views: 145,
    createdAt: "2024-01-12",
    images: ["/home/room3.png"],
  },
  {
    id: 7,
    title: "Phòng trọ sinh viên gần ĐH Kinh tế",
    category: "phong-tro",
    price: 2200000,
    area: 22,
    address: "Quận 10, TP.HCM",
    status: "active",
    views: 98,
    createdAt: "2024-01-25",
    images: ["/home/room4.png"],
  },
  {
    id: 8,
    title: "Căn hộ studio hiện đại tại Quận 5",
    category: "chung-cu",
    price: 6500000,
    area: 45,
    address: "Quận 5, TP.HCM",
    status: "inactive",
    views: 167,
    createdAt: "2024-01-08",
    images: ["/home/room1.png"],
  },
];

export default function MyPostsPage() {
  const { user } = useAuth();
  const [posts] = useState(mockPosts);

  const handleEdit = (id: number) => {
    console.log("Edit post:", id);
  };

  const handleView = (id: number) => {
    console.log("View post:", id);
  };

  const handleDelete = (id: number) => {
    console.log("Delete post:", id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài đăng của tôi</h1>
          <p className="text-gray-600">Quản lý các bài đăng phòng trọ của bạn</p>
        </div>

        <MyPostsContent
          posts={posts}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>

      <Footer />
    </div>
  );
}