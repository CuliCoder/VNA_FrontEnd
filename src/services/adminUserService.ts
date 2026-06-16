import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { ApiResponse } from "@/types/api";
import type { User, Role } from "@/types/auth";
import type {
  UserListParams,
  PaginatedUsers,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/adminUser";

export const adminUserService = {
  /** Lấy danh sách người dùng (phân trang + tìm kiếm) */
  getUsers: async (params?: UserListParams): Promise<PaginatedUsers> => {
    const { data } = await apiClient.get<PaginatedUsers>(
      API_ENDPOINTS.ADMIN_USERS.LIST,
      { params },
    );
    return data;
  },

  /** Lấy chi tiết một người dùng */
  getUserById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<User>(
      API_ENDPOINTS.ADMIN_USERS.DETAIL(id),
    );
    return data;
  },

  /** Tạo người dùng mới */
  createUser: async (payload: CreateUserRequest): Promise<User> => {
    const { data } = await apiClient.post<User>(
      API_ENDPOINTS.ADMIN_USERS.CREATE,
      payload,
    );
    return data;
  },

  /** Cập nhật thông tin người dùng */
  updateUser: async (id: number, payload: UpdateUserRequest): Promise<User> => {
    const { data } = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN_USERS.UPDATE(id),
      payload,
    );
    return data.data;
  },

  /** Bật/tắt kích hoạt tài khoản */
  toggleStatus: async (id: number, isActive: boolean): Promise<User> => {
    const { data } = await apiClient.patch<User>(
      API_ENDPOINTS.ADMIN_USERS.TOGGLE_STATUS(id),
      { isActive }
    );
    return data;
  },

  /** Reset mật khẩu người dùng */
  resetPassword: async (id: number): Promise<{ newPassword: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ newPassword: string }>>(
      API_ENDPOINTS.ADMIN_USERS.RESET_PASSWORD(id),
    );
    return data.data;
  },

  /** Upload avatar cho người dùng */
  uploadAvatar: async (formData: FormData): Promise<string> => {
    const { data } = await apiClient.post<{ url: string }>(
      API_ENDPOINTS.ADMIN_USERS.UPLOAD_AVATAR,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.url;
  },

  /** Lấy danh sách vai trò */
  getRoles: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>(
      API_ENDPOINTS.ADMIN_USERS.GET_ROLES,
    );
    return data;
  },

  /** Lấy danh sách chức vụ */
  getPositions: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>(
      API_ENDPOINTS.ADMIN_USERS.GET_POSITIONS,
    );
    return data;
  },

  initPassword: async (
    userId: number,
    newPassword: string,
  ): Promise<string> => {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.ADMIN_USERS.RESET_PASSWORD(userId),
      { newPassword },
    );
    return data.message;
  },

  /** Xóa nhiều người dùng */
  bulkDeleteUsers: async (ids: number[]): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ADMIN_USERS.BULK_DELETE, {ids:ids});
  },

  /** Xuất danh sách người dùng */
  exportUsers: async (params?: UserListParams): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(
      API_ENDPOINTS.ADMIN_USERS.EXPORT,
      { params, responseType: "blob" }
    );
    return data;
  },

  /** Nhập danh sách người dùng từ file Excel */
  importUsers: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    await apiClient.post(API_ENDPOINTS.ADMIN_USERS.IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};  
