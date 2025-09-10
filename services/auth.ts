import { apiPost } from "@/utils/api";
import { User } from "@/types/User";

export async function loginService(
  email: string,
  password: string
): Promise<{ access_token: string; user: User }> {
  return apiPost("users/login", { email, password });
}

export async function logoutService() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
