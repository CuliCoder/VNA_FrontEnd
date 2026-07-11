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
    REGISTER_ENTERPRISE_REQUEST: "/auth/register-enterprise/request",
    REGISTER_ENTERPRISE_VERIFY: "/auth/register-enterprise/verify",
    REGISTER_ENTERPRISE_CONFIRM: "/auth/register-enterprise/confirm",
    REGISTER_ENTERPRISE_UPLOAD: "/auth/register-enterprise/upload",
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
    UPLOAD_AVATAR: `/users/upload-avatar`,
    GET_POSITIONS: "/users/positions",
    GET_ROLES: "/users/roles",
    BULK_DELETE: "/users/bulk-delete",
    EXPORT: "/users/export",
    IMPORT: "/users/import",
    IMPORT_PREVIEW: "/users/import-preview",
    IMPORT_CONFIRM: "/users/import-confirm",
  },
  ROLES: {
    LIST: "/roles",
  },
  ENTERPRISES: {

    LIST_ENTERPRISES: "/enterprises",
    CREATE: "/enterprises",
    DETAIL: (id: number) => `/enterprises/${id}`, //patch : cap nhat thong tin doanh nghiep, delete : xoa doanh nghiep, get : lay thong tin chi tiet doanh nghiep 

    CHANGE_STATUS: (id: number) => `/enterprises/${id}/status`, // trang thai cua doanh nghiep
    CHANGE_PASSWORD: "/enterprises/change-password",
    UPLOAD: "/enterprises/upload", //post : upload file pdf/anh thong tin doanh nghiep, delete : xoa file excel dinh kem khoi supabase storage
    import: "/enterprises/import", //post : upload file excel danh sach doanh nghiep, delete : xoa file excel dinh kem khoi supabase storage
    IMPORT: "/enterprises/import", // IMPORT danh sach doanh nghiep tu file excel
    IMPORT_REVIEW: "/enterprises/import-preview",
    IMPORT_CONFIRM: "/enterprises/import-confirm",
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
  },
  REPORTS: {
    CATEGORIES: "/reports/categories",
    LIST: "/reports",
    INIT: (periodId: number) => `/reports/period/${periodId}/init`,
    DETAIL: (id: number) => `/reports/${id}`,
    UPDATE: (id: number) => `/reports/${id}`,
    SUBMIT: (id: number) => `/reports/${id}/submit`,
    UPLOAD: (id: number) => `/reports/${id}/upload`,
    EXPORT_WORD: (id: number) => `/reports/${id}/export-word`,
  },

  REPORT_PERIODS: {

    ROOT: "/report-periods", //get : lay danh sach ky bao cao, post : tao moi ky bao cao
    DETAIL: (id: number) => `/report-periods/${id}`, //get : lay thong tin chi tiet mot ki bao cao, post : cap nhat thong tin ki bao cao, delete : xoa ki bao cao
    STATUS: (id: number) => `/report-periods/${id}/status`,

  },

  CATEGORIES: {
    ROOT: "/categories", //get : lay danh sach danh muc, post : tao moi danh muc
    DETAIL: (id: number) => `/categories/${id}`, //get : lay thong tin chi tiet mot danh muc, patch : cap nhat thong tin danh muc, delete : xoa danh muc
    EXPORT: "/categories/export", //get : xuat danh sach danh muc ra file excel
    IMPORT: "/categories/import", //post : upload file excel danh sach danh muc, delete : xoa file excel dinh kem khoi supabase storage
  },

  DEPARTMENTS_REPORT: {
    LIST: "/department-reports", //get : API chính để hiển thị bảng báo cáo của các doanh nghiệp cho Role Sở (Quản lý/Admin). Hỗ trợ phân trang, tìm kiếm tự do theo Tên doanh nghiệp/Mã số thuế, và lọc theo Tỉnh, Phường/Xã, Năm, Kỳ báo cáo, Trạng thái.
    BY_WARD: "/department-reports/statistics-by-ward", //get : API phục vụ bảng tổng hợp phân bố báo cáo theo đơn vị hành chính cấp Phường/Xã trực thuộc Tỉnh đã chọn. Yêu cầu bắt buộc truyền năm báo cáo (year) và mã Tỉnh (provinceId).
    FILTER: "/department-reports/filter-options", //get : API phục vụ lấy dữ liệu nguồn để điền (populate) vào các ô chọn Dropdown trên giao diện lọc. Trả về mảng các năm hiện có trong database, danh sách các kỳ báo cáo và trạng thái kèm nhãn hiển thị tiếng Việt. Frontend nên gọi API này 1 lần duy nhất khi vừa tải trang.
    BULK_APPROVE: "/department-reports/bulk-approve", //post : duyệt hàng loạt báo cáo
    BULK_REJECT: "/department-reports/bulk-reject"  ,//post : từ chối hàng loạt báo cáo
  },

  SUMMARY_REPORTS: {
    GENERAL: "/summary-reports/general-summary", //get : API phục vụ bảng tổng hợp báo cáo chung cho Role Sở (Quản lý/Admin). phần 1 thông tin tổng quan
    ACCIDENT: "/summary-reports/accident-classified-summary", //get : API phục vụ bảng tổng hợp báo cáo chung cho Role Sở (Quản lý/Admin). phần 2 thông tin tai nạn lao động
  }
} as const;