import { Delete } from "lucide-react";

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
  TIMEOUT: 15000,
  HEADERS: {
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
  ENTERPRISES : {

  LIST_ENTERPRISES: "/enterprises",
  CREATE: "/enterprises",
  DETAIL: (id: number) => `/enterprises/${id}`, //patch : cap nhat thong tin doanh nghiep, delete : xoa doanh nghiep, get : lay thong tin chi tiet doanh nghiep 

  CHANGE_STATUS: (id: number) => `/enterprises/${id}/status`, // trang thai cua doanh nghiep
  CHANGE_PASSWORD: "/enterprises/change-password",
  UPLOAD: "/enterprises/upload", //post : upload file pdf/anh thong tin doanh nghiep, delete : xoa file excel dinh kem khoi supabase storage
  import: "/enterprises/import", //post : upload file excel danh sach doanh nghiep, delete : xoa file excel dinh kem khoi supabase storage
  IMPORT: "/enterprises/import", // IMPORT danh sach doanh nghiep tu file excel
},

BUSINESS_FIELDS: {
   ROOT: "/business-fields", //get : lay danh sach nganh nghe kinh doanh, post : tao moi nganh nghe kinh doanh
  DETAIL: (id: number) => `/business-fields/${id}`, //patch : cap nhat nganh nghe kinh doanh, delete : xoa nganh nghe kinh doanh
  IMPORT: "/business-fields/import",
},
BUSINESS_TYPES: {
   ROOT: "/business-types", //get : lay danh sach loai hinh kinh doanh, post : tao moi loai hinh kinh doanh
  DETAIL: (id: number) => `/business-types/${id}`, //patch : cap nhat loai hinh kinh doanh, delete : xoa loai hinh kinh doanh
  IMPORT: "/business-types/import",
}

} as const;