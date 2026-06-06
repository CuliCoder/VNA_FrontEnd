import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { User } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

export interface UpdateProfileRequest {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  position?: string;
  provinceId?: number;
  wardId?: number;
  address?: string;
  isActive?: boolean;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return data.data;
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<User> => {
    const { data } = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.USERS.PROFILE, payload);
    return data.data;
  },

  requestEmailChange: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.USERS.EMAIL_CHANGE_REQUEST);
  },

  verifyEmailChangeOtp: async (otp: string): Promise<boolean> => {
    const { data } = await apiClient.post<{ success: boolean }>(API_ENDPOINTS.USERS.EMAIL_CHANGE_VERIFY, { otp });
    return data.success;
  },

  updateEmail: async (newEmail: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.USERS.EMAIL_CHANGE_UPDATE, { email: newEmail });
  }
};
