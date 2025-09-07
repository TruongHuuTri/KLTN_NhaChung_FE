import { apiPost } from "@/utils/api";

export async function createRentPost(category: string, payload: any) {
  return apiPost(`rent-posts/${category}`, payload);
}
