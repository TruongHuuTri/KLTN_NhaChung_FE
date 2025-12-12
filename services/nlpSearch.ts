// API base
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type NlpSearchParams = {
  q: string;
};

export type NlpSearchItem = {
  postId: number;
  roomId?: number;
  title?: string;
  description?: string;
  images?: string[];
  price?: number;
  area?: number;
  address?: { full?: string; [k: string]: any } | any;
  distance?: number;
  highlight?: Record<string, string[]>;
  createdAt?: string;
  [key: string]: any;
};

export type NlpSearchData = {
  items: NlpSearchItem[];
  page: number;
  limit: number;
  total: number;
};

export async function searchNLP(
  q: string,
  opts?: { signal?: AbortSignal }
): Promise<NlpSearchData> {
  if (!q || !q.trim()) {
    throw Object.assign(new Error("Thiếu truy vấn tìm kiếm"), { status: 400 });
  }
  const url = new URL("/api/search/nlp", API_BASE);
  url.searchParams.set("q", q.trim());
  const res = await fetch(url.toString(), { signal: opts?.signal });
  if (!res.ok)
    throw Object.assign(new Error("NLP search failed"), { status: res.status });
  const json = await res.json();
  return json.data as NlpSearchData;
}

export async function searchPosts(
  params: Record<string, string>,
  opts?: { signal?: AbortSignal }
) {
  const url = new URL("/api/search/posts", API_BASE);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { signal: opts?.signal });
  if (!res.ok)
    throw Object.assign(new Error("Search failed"), { status: res.status });
  return res.json();
}

// Giữ hàm cũ để tương thích tạm thời với các nơi đang gọi nlpSearch({ q })
// (Đã chuẩn hóa dùng searchNLP trực tiếp; hàm tương thích cũ đã được loại bỏ)

/**
 * Gọi unified search API (/api/search) cho cả trường hợp có/không query.
 * Nhận vào URLSearchParams hoặc object params, trả về JSON parse sẵn.
 */
export async function searchUnified(
  rawParams:
    | URLSearchParams
    | Record<string, string | number | undefined | null>,
  opts?: { signal?: AbortSignal }
): Promise<any> {
  const params =
    rawParams instanceof URLSearchParams ? rawParams : new URLSearchParams();
  if (!(rawParams instanceof URLSearchParams)) {
    Object.entries(rawParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && `${v}`.length > 0)
        params.set(k, String(v));
    });
  }

  const url = new URL("/api/search", API_BASE);
  params.forEach((v, k) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method: "GET",
    signal: opts?.signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw Object.assign(new Error("Search failed"), { status: res.status });
  }
  return res.json();
}
