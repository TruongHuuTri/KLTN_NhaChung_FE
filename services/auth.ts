import { apiPost } from "@/utils/api";
import { User } from "@/types/User";

export async function loginService(
  email: string,
  password: string
): Promise<{ access_token: string; user: User }> {
  return apiPost("users/login", { email, password });
}

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: "user" | "landlord";
};

export async function registerService(payload: RegisterPayload): Promise<{ message: string; email: string; expiresIn?: number }> {
  // Theo registration-system.md: dùng /auth/register để gửi OTP (public)
  return apiPost("auth/register", payload as any);
}

export async function logoutService() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

// --- Registration OTP flow ---
export async function verifyRegistration(email: string, otp: string) {
  return apiPost<{ message: string; user?: User }>("auth/verify-registration", { email, otp });
}

export async function resendRegistrationOtp(email: string) {
  return apiPost<{ message: string; email: string; expiresIn: number }>("auth/resend-otp", { email });
}
