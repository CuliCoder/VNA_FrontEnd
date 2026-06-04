import apiClient from "@/lib/api";
import { storage } from "@/lib/storage";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { ApiResponse } from "@/types/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ForgotPasswordResponse,
  User,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload,
    );
    storage.setUser(data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      storage.clearAll();
    }
  },

  async register(payload: RegisterRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload,
    );
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME,
    );
    storage.setUser(data.data);
    return data.data;
  },

  async forgotPassword(
    payload: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    const { data } = await apiClient.post<ForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload,
    );
    return data;
  },

  async resetPassword(
    payload: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse | null> {
    const { data } = await apiClient.post<ResetPasswordResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      payload,
    );
    return data;
  },
};
