// Verification constants
export const VERIFICATION_CONSTANTS = {
  // Image compression
  MAX_IMAGE_WIDTH: 400,
  IMAGE_QUALITY: 0.6,
  MAX_TOTAL_SIZE: 1024 * 1024, // 1MB
  
  // Face matching
  SIMILARITY_THRESHOLD: 50,
  
  // File formats
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
  
  // Error messages
  MESSAGES: {
    IMAGE_TOO_LARGE: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.',
    REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin bắt buộc',
    SUBMIT_SUCCESS: 'Gửi yêu cầu xác thực thành công!',
    SUBMIT_SUCCESS_WITHOUT_IMAGES: 'Gửi yêu cầu xác thực thành công (không có ảnh)!',
    SUBMIT_ERROR: 'Gửi yêu cầu xác thực thất bại:',
    FACE_MATCH_ERROR: 'Lỗi khi so sánh khuôn mặt:',
    UPLOAD_IMAGES_REQUIRED: 'Vui lòng tải lên đầy đủ ảnh CCCD và ảnh khuôn mặt',
    OTP_INVALID: 'OTP gồm 6 chữ số'
  }
} as const;
