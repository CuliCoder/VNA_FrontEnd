export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
  TIMEOUT: 15000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/users/me",
  },
  USERS: {
    PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    EMAIL_CHANGE_REQUEST: "/users/email-change/request",
    EMAIL_CHANGE_VERIFY: "/users/email-change/verify",
    EMAIL_CHANGE_UPDATE: "/users/email-change/update",
    UPLOAD_AVATAR: "/users/avatar",
  },
  BUSINESS: {
    CREATE: "/business",
  }
} as const;
