const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ClickEventPayload = {
  userId: number;
  postId?: number;
  roomId?: number;
  amenities?: string[];
};

/**
 * Gửi click signal lên BE (silent fail)
 */
export async function logClickEvent(
  payload: ClickEventPayload,
  opts?: { signal?: AbortSignal }
) {
  const url = new URL("/api/events/click", API_BASE);

  try {
    await fetch(url.toString(), {
      method: "POST",
      signal: opts?.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore errors to avoid breaking UX
  }
}
