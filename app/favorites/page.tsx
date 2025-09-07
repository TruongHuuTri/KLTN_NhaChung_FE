"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/common/Footer";
import FavoritesContent from "../../components/favorites/FavoritesContent";

// Mock data cho danh sách yêu thích
const mockFavorites = [
  {
    id: 1,
    title: "Phòng trọ đẹp gần trường ĐH Bách Khoa",
    category: "phong-tro",
    price: 2500000,
    area: 25,
    address: "Quận 10, TP.HCM",
    owner: "Nguyễn Văn A",
    phone: "0123456789",
    addedAt: "2024-01-15",
    images: ["/home/room1.png", "/home/room2.png"],
    description: "Phòng trọ đẹp, thoáng mát, gần trường ĐH Bách Khoa. Có đầy đủ tiện nghi cơ bản.",
  },
  {
    id: 2,
    title: "Căn hộ chung cư 2PN 2WC tại Quận 7",
    category: "chung-cu",
    price: 8000000,
    area: 65,
    address: "Quận 7, TP.HCM",
    owner: "Trần Thị B",
    phone: "0987654321",
    addedAt: "2024-01-12",
    images: ["/home/room3.png"],
    description: "Căn hộ chung cư cao cấp, view đẹp, gần trung tâm thương mại.",
  },
  {
    id: 3,
    title: "Nhà nguyên căn 3 tầng tại Quận 2",
    category: "nha-nguyen-can",
    price: 15000000,
    area: 120,
    address: "Quận 2, TP.HCM",
    owner: "Lê Văn C",
    phone: "0369852147",
    addedAt: "2024-01-10",
    images: ["/home/room4.png"],
    description: "Nhà nguyên căn 3 tầng, có sân vườn, gần sông, không khí trong lành.",
  },
  {
    id: 4,
    title: "Phòng trọ giá rẻ gần chợ Bến Thành",
    category: "phong-tro",
    price: 1800000,
    area: 20,
    address: "Quận 1, TP.HCM",
    owner: "Phạm Thị D",
    phone: "0741852963",
    addedAt: "2024-01-08",
    images: ["/home/room1.png"],
    description: "Phòng trọ giá rẻ, gần chợ Bến Thành, thuận tiện đi lại.",
  },
  {
    id: 5,
    title: "Căn hộ cao cấp view sông tại Quận 4",
    category: "chung-cu",
    price: 12000000,
    area: 85,
    address: "Quận 4, TP.HCM",
    owner: "Hoàng Văn E",
    phone: "0521478963",
    addedAt: "2024-01-20",
    images: ["/home/room2.png"],
    description: "Căn hộ cao cấp với view sông tuyệt đẹp, nội thất sang trọng.",
  },
  {
    id: 6,
    title: "Nhà phố 2 tầng tại Quận 3",
    category: "nha-nguyen-can",
    price: 20000000,
    area: 150,
    address: "Quận 3, TP.HCM",
    owner: "Vũ Thị F",
    phone: "0963258741",
    addedAt: "2024-01-18",
    images: ["/home/room3.png"],
    description: "Nhà phố 2 tầng, vị trí trung tâm, gần các trường học và bệnh viện.",
  },
  {
    id: 7,
    title: "Phòng trọ sinh viên gần ĐH Kinh tế",
    category: "phong-tro",
    price: 2200000,
    area: 22,
    address: "Quận 10, TP.HCM",
    owner: "Đặng Văn G",
    phone: "0147852963",
    addedAt: "2024-01-25",
    images: ["/home/room4.png"],
    description: "Phòng trọ dành cho sinh viên, gần ĐH Kinh tế, có wifi miễn phí.",
  },
  {
    id: 8,
    title: "Căn hộ studio hiện đại tại Quận 5",
    category: "chung-cu",
    price: 6500000,
    area: 45,
    address: "Quận 5, TP.HCM",
    owner: "Bùi Thị H",
    phone: "0789632145",
    addedAt: "2024-01-22",
    images: ["/home/room1.png"],
    description: "Căn hộ studio hiện đại, thiết kế tối ưu không gian, phù hợp cho người độc thân.",
  },
  {
    id: 9,
    title: "Phòng trọ có ban công tại Quận 6",
    category: "phong-tro",
    price: 2800000,
    area: 28,
    address: "Quận 6, TP.HCM",
    owner: "Lý Văn I",
    phone: "0321654987",
    addedAt: "2024-01-28",
    images: ["/home/room2.png"],
    description: "Phòng trọ có ban công rộng, thoáng mát, gần chợ và siêu thị.",
  },
  {
    id: 10,
    title: "Nhà vườn 1 tầng tại Quận 9",
    category: "nha-nguyen-can",
    price: 18000000,
    area: 200,
    address: "Quận 9, TP.HCM",
    owner: "Trịnh Văn K",
    phone: "0958741236",
    addedAt: "2024-01-30",
    images: ["/home/room3.png"],
    description: "Nhà vườn 1 tầng, có sân vườn rộng, không khí trong lành, yên tĩnh.",
  },
];

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(mockFavorites);

  const handleContact = (id: number) => {
    console.log("Contact favorite:", id);
  };

  const handleView = (id: number) => {
    console.log("View favorite:", id);
  };

  const handleRemove = (id: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách yêu thích</h1>
          <p className="text-gray-600">Các phòng trọ bạn đã lưu để xem sau</p>
        </div>

        <FavoritesContent
          favorites={favorites}
          onContact={handleContact}
          onView={handleView}
          onRemove={handleRemove}
        />
      </div>

      <Footer />
    </div>
  );
}