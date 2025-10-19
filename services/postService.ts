import { apiService } from './apiService';

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  category: 'Cho thuê' | 'Tìm ở ghép';
  content: string;
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Hết hạn';
}

class PostService {
  private token: string | null;

  constructor() {
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      return await apiService.get('/posts', this.getHeaders());
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  }

  async getPostById(id: number): Promise<Post> {
    try {
      return await apiService.get(`/posts/${id}`, this.getHeaders());
    } catch (error) {
      console.error('Get post error:', error);
      throw error;
    }
  }

  async approvePost(id: number): Promise<void> {
    try {
      await apiService.put(`/posts/${id}/approve`, {}, this.getHeaders());
    } catch (error) {
      console.error('Approve post error:', error);
      throw error;
    }
  }

  async rejectPost(id: number): Promise<void> {
    try {
      await apiService.put(`/posts/${id}/reject`, {}, this.getHeaders());
    } catch (error) {
      console.error('Reject post error:', error);
      throw error;
    }
  }

  async deletePost(id: number): Promise<void> {
    try {
      await apiService.delete(`/posts/${id}`, this.getHeaders());
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  }

  async deleteMultiplePosts(ids: number[]): Promise<void> {
    try {
      await apiService.post('/posts/delete-multiple', { ids }, this.getHeaders());
    } catch (error) {
      console.error('Delete multiple posts error:', error);
      throw error;
    }
  }
}

export const postService = new PostService();
export default PostService;
