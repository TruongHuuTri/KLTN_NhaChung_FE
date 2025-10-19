import { useState, useEffect } from 'react';
import { verificationService, Verification, VerificationFilters, VerificationListResponse, VerificationWithImages } from '../services/verificationService';

export interface UseAdminVerificationsReturn {
  verifications: Verification[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  fetchVerifications: (filters?: VerificationFilters) => Promise<void>;
  getVerificationImages: (verificationId: number) => Promise<VerificationWithImages>;
  getVerificationWithImages: (verificationId: number) => Promise<VerificationWithImages>;
  approveVerification: (verificationId: number, adminNote?: string) => Promise<void>;
  rejectVerification: (verificationId: number, adminNote: string) => Promise<void>;
  refreshVerifications: () => Promise<void>;
}

export function useAdminVerifications(initialFilters?: VerificationFilters): UseAdminVerificationsReturn {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<VerificationFilters>(initialFilters || {});

  const fetchVerifications = async (filters?: VerificationFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filtersToUse = filters || currentFilters;
      setCurrentFilters(filtersToUse);
      
      const response = await verificationService.getAllVerifications(filtersToUse);
      setVerifications(response.verifications);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages
      });
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách xác thực');
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (verificationId: number, adminNote?: string) => {
    try {
      await verificationService.approveVerification(verificationId, adminNote);
      // Refresh verifications list after approval
      await fetchVerifications();
    } catch (err) {
      console.error('Error approving verification:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi duyệt hồ sơ');
      throw err;
    }
  };

  const rejectVerification = async (verificationId: number, adminNote: string) => {
    try {
      await verificationService.rejectVerification(verificationId, adminNote);
      // Refresh verifications list after rejection
      await fetchVerifications();
    } catch (err) {
      console.error('Error rejecting verification:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi từ chối hồ sơ');
      throw err;
    }
  };

  const getVerificationImages = async (verificationId: number) => {
    try {
      return await verificationService.getVerificationImages(verificationId);
    } catch (err) {
      console.error('Error getting verification images:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải hình ảnh');
      throw err;
    }
  };

  const getVerificationWithImages = async (verificationId: number) => {
    try {
      return await verificationService.getVerificationWithImages(verificationId);
    } catch (err) {
      console.error('Error getting verification with images:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin xác thực');
      throw err;
    }
  };

  const refreshVerifications = async () => {
    await fetchVerifications();
  };

  // Load initial data
  useEffect(() => {
    fetchVerifications();
  }, []);

  return {
    verifications,
    pagination,
    loading,
    error,
    fetchVerifications,
    getVerificationImages,
    getVerificationWithImages,
    approveVerification,
    rejectVerification,
    refreshVerifications
  };
}
