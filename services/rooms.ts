import { apiGet, apiPost, apiPut, apiDel } from "@/utils/api";
import { 
  Room, 
  CreateRoomPayload, 
  UpdateRoomPayload, 
  SoftDeletePayload,
  RoomListResponse,
  RoomListParams 
} from "@/types/Room";

// Lấy danh sách phòng của landlord
export async function getRooms(params: RoomListParams = {}): Promise<RoomListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.buildingId) searchParams.append('buildingId', params.buildingId.toString());
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  // Include thông tin building
  searchParams.append('include', 'building');
  
  const queryString = searchParams.toString();
  return apiGet(`landlord/rooms${queryString ? `?${queryString}` : ''}`);
}

// Lấy chi tiết phòng
export async function getRoomById(id: number): Promise<Room> {
  // Public endpoint để mọi user (kể cả role 'user') có thể xem chi tiết phòng
  return apiGet(`rooms/${id}?include=building`);
}

// Tạo phòng mới
export async function createRoom(payload: CreateRoomPayload): Promise<Room> {
  return apiPost("landlord/rooms", payload);
}

// Cập nhật phòng
export async function updateRoom(id: number, payload: UpdateRoomPayload): Promise<Room> {
  return apiPut(`landlord/rooms/${id}`, payload);
}

// Soft delete phòng (ẩn khỏi danh sách)
export async function softDeleteRoom(id: number): Promise<Room> {
  return apiPut(`landlord/rooms/${id}`, { isActive: false });
}

// Xóa phòng (theo integration guide)
export async function deleteRoom(id: number): Promise<{ message: string }> {
  // Validate roomId
  if (!id || isNaN(id) || id <= 0) {
    throw new Error(`Invalid room ID: ${id}`);
  }
  
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/landlord/rooms/${id}`;
  
  console.log("🔗 DELETE API call:", {
    roomId: id,
    roomIdType: typeof id,
    url: apiUrl,
    method: 'DELETE',
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
  });
  
  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });

  console.log("📡 Response:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    console.error("❌ Error response:", errorData);
    throw new Error(errorData.message || 'Failed to delete room');
  }

  // Kiểm tra xem response có content không
  const contentType = response.headers.get('content-type');
  console.log("📄 Response content-type:", contentType);
  
  let result;
  if (contentType && contentType.includes('application/json')) {
    try {
      result = await response.json();
      console.log("✅ Success response (JSON):", result);
    } catch (error) {
      console.log("⚠️ JSON parse failed, treating as success");
      result = { message: "Room deleted successfully" };
    }
  } else {
    // Response không phải JSON (có thể là empty hoặc text)
    const text = await response.text();
    console.log("✅ Success response (text):", text);
    result = { message: text || "Room deleted successfully" };
  }
  
  return result;
}

// Upload hình ảnh phòng
export async function uploadRoomImages(images: File[]): Promise<string[]> {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`images`, image);
  });
  
  return apiPost("upload/room-images", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// Lấy danh sách phòng theo dãy
export async function getRoomsByBuilding(
  buildingId: number,
  page: number = 1,
  limit: number = 10
): Promise<RoomListResponse> {
  return getRooms({ buildingId, page, limit });
}
