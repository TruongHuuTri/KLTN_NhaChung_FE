import { apiService } from './apiService';

class AdminService {
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
    
    // Lazy load token from localStorage only when needed
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('adminToken');
      return this.token;
    }
    
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`
    };
  }

  async login(email: string, password: string) {
    try {
      const data = await apiService.post<{ access_token: string; admin: any }>('/admin/login', { email, password });
      this.setToken(data.access_token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getAllAdmins() {
    try {
      return await apiService.get('/admin', this.getHeaders());
    } catch (error) {
      console.error('Get admins error:', error);
      throw error;
    }
  }

  async getCurrentAdmin() {
    try {
      return await apiService.get('/admin/me', this.getHeaders());
    } catch (error) {
      console.error('Get current admin error:', error);
      throw error;
    }
  }

  async createAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    try {
      return await apiService.post('/admin/create', adminData);
    } catch (error) {
      console.error('Create admin error:', error);
      throw error;
    }
  }

  async updateAdmin(adminId: number, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    isActive?: boolean;
  }) {
    try {
      return await apiService.put(`/admin/${adminId}`, updateData, this.getHeaders());
    } catch (error) {
      console.error('Update admin error:', error);
      throw error;
    }
  }

  async changePassword(adminId: number, currentPassword: string, newPassword: string) {
    try {
      return await apiService.put(`/admin/${adminId}/change-password`, {
        currentPassword,
        newPassword
      }, this.getHeaders());
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default AdminService;
