import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { ApiResponse } from "@/types/api";
import type {
  ChangeEmailVerificationResponse,
  ChangeEmailSuccessResponse,
  User,
} from "@/types/auth";
import type {
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadAvatarResponse,
} from "@/types/user";
export const userService = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME,
    );
    return data.data;
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<User> => {
    const { data } = await apiClient.put<UpdateProfileResponse>(
      API_ENDPOINTS.USERS.PROFILE,
      payload,
    );
    return data.user;
  },

  requestEmailChange: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.USERS.EMAIL_CHANGE_REQUEST);
  },

  verifyEmailChangeOtp: async (
    otp: string,
  ): Promise<ChangeEmailVerificationResponse> => {
    const { data } = await apiClient.post<ChangeEmailVerificationResponse>(
      API_ENDPOINTS.USERS.EMAIL_CHANGE_VERIFY,
      { otp },
    );
    return data;
  },

  updateEmail: async (
    newEmail: string,
    verificationToken: string,
  ): Promise<ChangeEmailSuccessResponse> => {
    const { data } = await apiClient.post<ChangeEmailSuccessResponse>(
      API_ENDPOINTS.USERS.EMAIL_CHANGE_UPDATE,
      {
        newEmail: newEmail,
        verificationToken,
      },
    );
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  },
  uploadAvatar: async (formData: FormData): Promise<string> => {
    const { data } = await apiClient.post<UploadAvatarResponse>(
      API_ENDPOINTS.USERS.UPLOAD_AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data.avatarUrl;
  },
};
