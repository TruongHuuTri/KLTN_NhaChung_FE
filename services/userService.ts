import { apiService } from './apiService';

interface User {
  id: number;
  name: string;
  username: string;
  phone: string;
  email: string;
  avatar: string;
}

interface AdminUser {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class UserService {
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

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`
    };
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await apiService.get('/users', this.getHeaders());
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      return await apiService.get(`/users/${id}`, this.getHeaders());
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await apiService.delete(`/users/${id}`, this.getHeaders());
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  async resetUserPassword(id: number, newPassword: string): Promise<void> {
    try {
      await apiService.put(`/users/${id}/reset-password`, { newPassword }, this.getHeaders());
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Admin API for resetting user password (auto-generate new password)
  async resetUserPasswordForAdmin(userId: number): Promise<{ message: string; newPassword: string }> {
    try {
      return await apiService.post(`/users/admin/${userId}/reset-password`, {}, this.getHeaders());
    } catch (error) {
      console.error('Reset user password for admin error:', error);
      throw error;
    }
  }

  // Admin APIs for user management
  async getAllUsersForAdmin(): Promise<AdminUser[]> {
    try {
      return await apiService.get('/users/admin', this.getHeaders());
    } catch (error) {
      console.error('Get users for admin error:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<{ message: string; user: AdminUser }> {
    try {
      return await apiService.put(`/users/admin/${userId}/status`, { isActive }, this.getHeaders());
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default UserService;
export type { AdminUser };
