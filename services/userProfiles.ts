import { apiGet, apiPatch, apiPost } from "@/utils/api";

// Cho phép điền từng ô (min/max) theo thời gian, validate đầy đủ trước khi submit ở BE
export interface BudgetRange { min?: number; max?: number }

export interface UserProfile {
  profileId?: number;
  userId?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  income?: number;
  currentLocation?: string;
  preferredDistricts?: string[];
  budgetRange?: BudgetRange;
  roomType?: string[];
  amenities?: string[];
  lifestyle?: 'quiet' | 'social' | 'party' | 'study';
  smoking?: boolean;
  pets?: boolean;
  cleanliness?: number;
  socialLevel?: number;
  // landlord specific
  businessType?: 'individual' | 'company' | 'agency';
  experience?: 'new' | '1-2_years' | '3-5_years' | '5+_years';
  propertiesCount?: number;
  propertyTypes?: string[];
  targetDistricts?: string[];
  priceRange?: BudgetRange;
  targetTenants?: string[];
  managementStyle?: 'strict' | 'flexible' | 'friendly';
  responseTime?: 'immediate' | 'within_hour' | 'within_day';
  additionalServices?: string[];
  businessLicense?: string;
  taxCode?: string;
  bankAccount?: { bankName: string; accountNumber: string; accountHolder: string };
  contactMethod?: string[];
  availableTime?: { weekdays?: string; weekends?: string };
}

export function createProfile(data: UserProfile) {
  return apiPost<UserProfile>("user-profiles", data);
}

export function getMyProfile(userId: number) {
  return apiGet<UserProfile>(`user-profiles/user/${userId}`);
}

export function updateMyProfile(userId: number, data: Partial<UserProfile>) {
  return apiPatch<UserProfile>(`user-profiles/user/${userId}`, data as any);
}


