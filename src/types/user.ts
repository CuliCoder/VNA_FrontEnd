import { User } from "./auth";
export interface UpdateProfileRequest {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  position?: string;
  provinceId?: number;
  wardId?: number;
  address?: string;
  avatarUrl?: string | null;
}
export interface UpdateProfileResponse {
  message: string;
  user: User;
}
export interface UploadAvatarResponse {
  avatarUrl: string;
  user: User;
  message: string;
}
