import { apiService } from './apiService';

interface UserInfo {
  userId: number;
  name: string;
  email: string;
  avatar?: string;
}

interface AdminPost {
  postId: number;
  userId: number;
  postType: string;
  title: string;
  description: string;
  images: string[];
  roomId?: number;
  buildingId?: number;
  landlordId?: number;
  isManaged?: boolean;
  source?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  user?: UserInfo;
}

interface PostFilters {
  status?: string;
  postType?: string;
  userId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse {
  posts: AdminPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class PostService {
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
      'Authorization': `Bearer ${this.getToken()}`
    };
  }

  // Admin APIs for post management
  async getAllPosts(filters: PostFilters = {}): Promise<PaginatedResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.postType) queryParams.append('postType', filters.postType);
      if (filters.userId) queryParams.append('userId', filters.userId.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/admin/posts?${queryString}` : '/admin/posts';
      
      const response = await apiService.get(endpoint, this.getHeaders());
      
      // Calculate total pages
      const total = response.total || response.length || 0;
      const limit = response.limit || filters.limit || 10;
      const totalPages = Math.ceil(total / limit);
      
      return {
        posts: response.posts || response,
        total: total,
        page: response.page || 1,
        limit: limit,
        totalPages: totalPages
      };
    } catch (error) {
      console.error('Get all posts error:', error);
      throw error;
    }
  }

  async getPendingPosts(): Promise<AdminPost[]> {
    try {
      return await apiService.get('/admin/posts/pending', this.getHeaders());
    } catch (error) {
      console.error('Get pending posts error:', error);
      throw error;
    }
  }

  async approvePost(postId: number): Promise<{ postId: number; status: string; updatedAt: string }> {
    try {
      return await apiService.put(`/admin/posts/${postId}/approve`, {}, this.getHeaders());
    } catch (error) {
      console.error('Approve post error:', error);
      throw error;
    }
  }

  async rejectPost(postId: number, reason: string): Promise<{ postId: number; status: string; rejectionReason: string; updatedAt: string }> {
    try {
      return await apiService.put(`/admin/posts/${postId}/reject`, { reason }, this.getHeaders());
    } catch (error) {
      console.error('Reject post error:', error);
      throw error;
    }
  }
}

export const postService = new PostService();
export default PostService;
export type { AdminPost, PostFilters, PaginatedResponse };