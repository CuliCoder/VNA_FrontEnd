import { Delete } from "lucide-react";

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
    PERMISSIONS: "/users/me/permissions",
  },
  USERS: {
    PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    EMAIL_CHANGE_REQUEST: "/users/email-change/request",
    EMAIL_CHANGE_VERIFY: "/users/email-change/verify",  
    EMAIL_CHANGE_UPDATE: "/users/email-change/update",
    UPLOAD_AVATAR: "/users/avatar",
  },
  ADMIN_USERS: {
    LIST: "/users/get-all",
    DETAIL: (id: number) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: number) => `/users/${id}`,
    TOGGLE_STATUS: (id: number) => `/users/${id}/status`,
    RESET_PASSWORD: (id: number) => `/users/${id}/reset-password`,
    UPLOAD_AVATAR:`/users/upload-avatar`,
    GET_POSITIONS: "/users/positions",
    GET_ROLES: "/users/roles",
    BULK_DELETE: "/users/bulk-delete",
    EXPORT: "/users/export",
    IMPORT: "/users/import",
  },
  ROLES: {
    LIST: "/roles",
  },
  BUSINESS: {
    CREATE: "/business",
  }
} as const;
