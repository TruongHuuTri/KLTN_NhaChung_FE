import { apiService } from './apiService';

interface Feedback {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  title: string;
  content: string;
  status: 'Đã phản hồi' | 'Chưa phản hồi';
}

class FeedbackService {
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

  async getAllFeedbacks(): Promise<Feedback[]> {
    try {
      return await apiService.get('/feedbacks', this.getHeaders());
    } catch (error) {
      console.error('Get feedbacks error:', error);
      throw error;
    }
  }

  async getFeedbackById(id: number): Promise<Feedback> {
    try {
      return await apiService.get(`/feedbacks/${id}`, this.getHeaders());
    } catch (error) {
      console.error('Get feedback error:', error);
      throw error;
    }
  }

  async replyToFeedback(id: number, replyData: { title: string; content: string }): Promise<void> {
    try {
      await apiService.post(`/feedbacks/${id}/reply`, replyData, this.getHeaders());
    } catch (error) {
      console.error('Reply feedback error:', error);
      throw error;
    }
  }

  async deleteFeedback(id: number): Promise<void> {
    try {
      await apiService.delete(`/feedbacks/${id}`, this.getHeaders());
    } catch (error) {
      console.error('Delete feedback error:', error);
      throw error;
    }
  }

  async deleteMultipleFeedbacks(ids: number[]): Promise<void> {
    try {
      await apiService.post('/feedbacks/delete-multiple', { ids }, this.getHeaders());
    } catch (error) {
      console.error('Delete multiple feedbacks error:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
export default FeedbackService;
