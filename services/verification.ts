import { apiGet, apiPost } from "@/utils/api";
import { VerificationData, VerificationResponse, VerificationStatus } from "@/types/User";

/**
 * Submit verification request
 */
export async function submitVerification(verificationData: VerificationData): Promise<VerificationResponse> {
  return apiPost('verifications', verificationData);
}

/**
 * Get current user's verification status
 */
export async function getMyVerificationStatus(): Promise<VerificationStatus> {
  return apiGet('users/me/verification');
}
