// Export all services
export { adminService, AdminService } from './adminService';
export { apiService, ApiService } from './apiService';
export { userService, UserService } from './userService';
export { postService, PostService } from './postService';
export { feedbackService, FeedbackService } from './feedbackService';
export { verificationService, VerificationService } from './verificationService';

// Export service instances for easy access
export const services = {
  admin: adminService,
  api: apiService,
  user: userService,
  post: postService,
  feedback: feedbackService,
  verification: verificationService,
};
