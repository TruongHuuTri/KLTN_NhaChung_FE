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
  // Chuẩn hóa endpoint: dù API_BASE có /api hay không đều trỏ về /api/events/click
  const base = API_BASE.replace(/\/+$/, "");
  const url = base.endsWith("/api")
    ? `${base}/events/click`
    : `${base}/api/events/click`;

  console.log("[Click Event] Sending to:", url.toString());
  console.log("[Click Event] Payload:", payload);

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      signal: opts?.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log(
      "[Click Event] Response:",
      response.status,
      response.statusText
    );
    if (!response.ok) {
      console.warn(
        `[Click Event] Failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    // Log error để debug nhưng không làm gián đoạn UX
    console.error("[Click Event] Error:", error);
  }
}
