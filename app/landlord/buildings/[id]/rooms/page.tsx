"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getRooms, createRoom, deleteRoom, softDeleteRoom } from "@/services/rooms";
import { getBuildingById } from "@/services/buildings";
import { Room, RoomListParams, CreateRoomPayload } from "@/types/Room";
import { Building } from "@/types/Building";
import { extractApiErrorMessage } from "@/utils/api";
import RoomCardVertical from "@/components/landlord/RoomCardVertical";
import NotificationModal from "@/components/common/NotificationModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useNotification } from "@/hooks/useNotification";
import { useConfirm } from "@/hooks/useConfirm";
import RoomForm from "@/components/landlord/RoomForm";
import ChungCuForm from "@/components/landlord/forms/ChungCuForm";

export default function BuildingRoomsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const buildingId = Number(params.id);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const { confirm, showConfirm, hideConfirm, setLoading: setConfirmLoading, handleConfirm, handleCancel } = useConfirm();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const loadData = async () => {
    if (!buildingId) return;
    try {
      setLoading(true);
      setError(null);
      const [b, list] = await Promise.all([
        getBuildingById(buildingId),
        getRooms({ buildingId } as RoomListParams),
      ]);
      setBuilding(b);
      setRooms(list.rooms ?? list);
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "landlord") loadData();
  }, [user?.role, buildingId]);

  const filteredRooms = useMemo(() => {
    if (!search) return rooms;
    const q = search.toLowerCase();
    return rooms.filter((r) =>
      [r.roomNumber, r.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rooms, search]);

  const handleCreate = async (data: CreateRoomPayload | Partial<CreateRoomPayload>) => {
    const payload = data as CreateRoomPayload;
    payload.buildingId = buildingId;
    try {
      setLoading(true);
      await createRoom(payload);
      setShowCreate(false);
      await loadData();
    } catch (e: any) {
      alert(e?.message || "Không thể tạo phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => router.push(`/landlord/rooms/${id}/edit`);
  const handleView = (id: number) => router.push(`/landlord/rooms/${id}`);
  const handleDelete = (id: number) => {
    // Tìm room để lấy roomNumber
    const roomToDelete = rooms.find(room => {
      const roomId = (room as any).roomId || room.id;
      return roomId === id;
    });
    
    if (!roomToDelete) {
      showError(
        "Không tìm thấy phòng",
        "Phòng này có thể đã bị xóa hoặc không tồn tại."
      );
      return;
    }
    
    // Hiển thị confirm modal
    showConfirm(
      "Xác nhận xóa phòng",
      `Bạn có chắc chắn muốn xóa phòng ${roomToDelete.roomNumber}? Hành động này không thể hoàn tác.`,
      () => performDelete(id, roomToDelete.roomNumber),
      {
        confirmText: "Xóa phòng",
        cancelText: "Hủy",
        type: "danger"
      }
    );
  };

  const performDelete = async (id: number, roomNumber: string) => {
    // Validate roomId
    const validRoomId = Number(id);
    if (!validRoomId || isNaN(validRoomId) || validRoomId <= 0) {
      console.error("❌ Invalid room ID:", id, typeof id);
      showError(
        "ID phòng không hợp lệ",
        "Vui lòng thử lại hoặc liên hệ hỗ trợ."
      );
      hideConfirm();
      return;
    }
    
    console.log("🗑️ Deleting room:", {
      originalId: id,
      originalType: typeof id,
      validId: validRoomId,
      validType: typeof validRoomId,
      roomNumber: roomNumber
    });
    
    try {
      setConfirmLoading(true);
      await deleteRoom(validRoomId);
      
      // Cập nhật state ngay lập tức (theo integration guide)
      setRooms(prev => prev.filter(room => {
        const roomId = (room as any).roomId || room.id;
        return roomId !== validRoomId;
      }));
      
      // Đóng confirm modal
      hideConfirm();
      
      // Hiển thị thông báo thành công
      showSuccess(
        "Xóa phòng thành công!",
        `Phòng ${roomNumber} đã được xóa khỏi danh sách.`
      );
      
    } catch (error: any) {
      console.error("Error deleting room:", error);
      
      // Xử lý lỗi theo integration guide
      let errorMessage = "Có lỗi xảy ra khi xóa phòng";
      if (error?.status === 404) {
        errorMessage = "Không tìm thấy phòng để xóa";
      } else if (error?.status === 403) {
        errorMessage = "Bạn không có quyền xóa phòng này";
      } else if (error?.status === 500) {
        errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Đóng confirm modal
      hideConfirm();
      
      showError(
        "Không thể xóa phòng",
        errorMessage
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen grid place-items-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phòng trong dãy {building?.name || `#${buildingId}`}</h1>
            <p className="text-gray-500 text-sm">Quản lý các phòng thuộc dãy này</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            Thêm phòng
          </button>
        </div>

        <div className="mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm số phòng, mô tả..."
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Đang tải...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 mb-4">Chưa có phòng nào.</p>
            <button onClick={() => setShowCreate(true)} className="px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">Tạo phòng đầu tiên</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => (
              <RoomCardVertical
                key={room.id}
                room={room}
                onClick={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal create room */}
      {showCreate && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full max-h-[92vh] overflow-auto relative z-10">
              {building?.buildingType === "chung-cu" ? (
                <ChungCuForm
                  building={building}
                  initialData={{ buildingId }}
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreate(false)}
                  loading={loading}
                  existingRooms={rooms.map(r => ({ 
                    roomNumber: r.roomNumber, 
                    id: (r as any).roomId || r.id 
                  }))}
                />
              ) : (
                <RoomForm
                  buildings={building ? [building] : []}
                  initialData={{ buildingId }}
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreate(false)}
                  loading={loading}
                  existingRooms={rooms.map(r => ({ 
                    roomNumber: r.roomNumber, 
                    id: (r as any).roomId || r.id 
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
      />
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        type={confirm.type}
        loading={confirm.loading}
      />
    </div>
  );
}


