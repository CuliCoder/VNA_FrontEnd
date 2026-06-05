export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Đăng nhập thành công.",
    LOGIN_FAILED: "Tài khoản hoặc mật khẩu không đúng. Xin vui lòng thử lại",
    LOGIN_REQUIRED_FIELDS: "Vui lòng nhập đầy đủ thông tin",
    LOGOUT_SUCCESS: "Đã đăng xuất.",
    REGISTER_SUCCESS: "Đăng ký tài khoản thành công.",
    FORGOT_PASSWORD_SENT: "Gửi email thành công.",
    RESET_PASSWORD_SUCCESS: "Mật khẩu đã được đặt lại thành công.",
    SESSION_EXPIRED: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
    UNAUTHORIZED: "Bạn không có quyền truy cập trang này.",
    EMAIL_NOT_REGISTERED: "Email chưa được đăng ký trong hệ thống.",
    RESET_PASSWORD_REQUIRED_FIELDS: "Vui lòng điền đầy đủ thông tin.",
    RESET_PASSWORD_NOT_MATCH: "Mật khẩu xác nhận không khớp.",
    RESET_PASSWORD_FAILED: "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
  },
  VALIDATION: {
    REQUIRED: "Trường này là bắt buộc.",
    EMAIL_INVALID: "Email không hợp lệ.",
    PASSWORD_MIN: "Mật khẩu phải có ít nhất 8 ký tự.",
    PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp.",
    USERNAME_MIN: "Tên tài khoản phải có ít nhất 4 ký tự.",
  },
  COMMON: {
    NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng thử lại.",
    SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
    UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định.",
  },
} as const;
