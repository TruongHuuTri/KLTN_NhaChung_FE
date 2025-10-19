import { apiService } from './apiService';

export interface Verification {
  verificationId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  issueDate: string;
  issuePlace: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
  adminNote: string | null;
  faceMatchResult: {
    match: boolean;
    similarity: number;
    confidence: 'high' | 'low';
  };
}

export interface VerificationListResponse {
  verifications: Verification[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VerificationFilters {
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

class VerificationService {
  private token: string | null;

  constructor() {
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
    }
  }

  getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('adminToken');
      return this.token;
    }
    
    return null;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllVerifications(filters: VerificationFilters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const queryString = queryParams.toString();
      const url = `/verifications/admin${queryString ? `?${queryString}` : ''}`;
      
      return await apiService.get<VerificationListResponse>(url, this.getHeaders());
    } catch (error) {
      console.error('Get verifications error:', error);
      throw error;
    }
  }

  async getVerificationByUserId(userId: number) {
    try {
      return await apiService.get<Verification>(`/verifications/user/${userId}`, this.getHeaders());
    } catch (error) {
      console.error('Get verification by user ID error:', error);
      throw error;
    }
  }

  async approveVerification(verificationId: number, adminNote?: string) {
    try {
      return await apiService.put(`/verifications/admin/${verificationId}`, {
        status: 'approved',
        adminNote
      }, this.getHeaders());
    } catch (error) {
      console.error('Approve verification error:', error);
      throw error;
    }
  }

  async rejectVerification(verificationId: number, adminNote: string) {
    try {
      return await apiService.put(`/verifications/admin/${verificationId}`, {
        status: 'rejected',
        adminNote
      }, this.getHeaders());
    } catch (error) {
      console.error('Reject verification error:', error);
      throw error;
    }
  }
}

export const verificationService = new VerificationService();
export default VerificationService;
