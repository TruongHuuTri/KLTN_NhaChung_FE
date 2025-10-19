'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { useRouter } from 'next/navigation';

interface Admin {
  adminId: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
  lastLogin?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const token = adminService.getToken();
        if (token) {
          setIsLoggedIn(true);
          // Fetch current admin info from API
          try {
            const adminData = await adminService.getCurrentAdmin() as Admin;
            setAdmin(adminData);
          } catch (apiError) {
            console.error('Failed to fetch admin profile:', apiError);
            // Fallback to basic admin object if API fails
            setAdmin({
              adminId: 1,
              name: 'Admin System',
              email: 'admin@nhachung.com',
              role: 'admin',
              avatar: null,
              phone: '0999999999',
              lastLogin: new Date().toISOString(),
              isActive: true
            });
          }
        } else {
          setIsLoggedIn(false);
          setAdmin(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    // Delay auth check to avoid hydration issues
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await adminService.login(email, password);
      setAdmin(response.admin);
      setIsLoggedIn(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    adminService.clearToken();
    setAdmin(null);
    setIsLoggedIn(false);
    router.push('/login');
  };

  return {
    admin,
    isLoggedIn,
    loading,
    login,
    logout
  };
}
