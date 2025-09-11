// utils/api.ts
// Wrapper gọi API cho Next.js:
// - Base URL .env: NEXT_PUBLIC_API_URL=http://localhost:3001/api
// - Tự gắn Bearer token nếu có
// - 401: xóa token + user, KHÔNG redirect
// - Helpers: apiGet/apiPost/apiPut/apiDel

export const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

const join = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

export class ApiError extends Error {
  status: number;
  body?: any;
  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const safeParse = (txt: string) => {
  try {
    return txt ? JSON.parse(txt) : undefined;
  } catch {
    return txt;
  }
};

const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem("token");

export async function api<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const isFD = typeof FormData !== "undefined" && init.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    ...(!isFD ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(join(API_BASE, path), { ...init, headers });

  if (res.status === 204) return undefined as T;

  const raw = await res.text();
  const data = safeParse(raw);

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new ApiError(
      typeof data === "string" ? data : data?.message ?? "Unauthorized",
      401,
      data
    );
  }

  if (!res.ok) {
    throw new ApiError(
      typeof data === "string" ? data : data?.message ?? res.statusText,
      res.status,
      data
    );
  }

  return data as T;
}

export const apiGet = <T = any>(p: string, o?: RequestInit) =>
  api<T>(p, { ...o, method: "GET" });

export const apiPost = <T = any>(p: string, body?: any, o?: RequestInit) =>
  api<T>(p, {
    ...o,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiPut = <T = any>(p: string, body?: any, o?: RequestInit) =>
  api<T>(p, {
    ...o,
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiDel = <T = any>(p: string, o?: RequestInit) =>
  api<T>(p, { ...o, method: "DELETE" });

export const apiPatch = <T = any>(p: string, body?: any, o?: RequestInit) =>
  api<T>(p, {
    ...o,
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

// Helper: trích xuất thông báo lỗi thân thiện từ ApiError/Fetch error
export function extractApiErrorMessage(err: any): string {
  if (!err) return "Đã xảy ra lỗi không xác định";
  // ApiError từ api.ts
  if (typeof err === "object" && "status" in err && (err as any).status) {
    const body = (err as any).body;
    const msg = Array.isArray(body?.message) ? body.message.join("; ") : (body?.message ?? String(err.message ?? err.statusText ?? "Lỗi API"));
    return msg;
  }
  // Lỗi mạng
  if (String(err?.message || "").includes("Failed to fetch")) return "Không thể kết nối máy chủ. Kiểm tra API URL hoặc mạng.";
  return String(err?.message || err);
}
