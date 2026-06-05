// ─── Permission ───────────────────────────────────────────────────────────────
export interface Permission {
  id: number;
  code: string; // "USER_MANAGE" | "REPORT_VIEW" | ...
  name: string;
}

// ─── Role ─────────────────────────────────────────────────────────────────────
export interface Role {
  id: number;
  code: string; // "ADMIN" | "ENTERPRISE" | "MANAGER" | "INSPECTOR" | ...
  name: string; // "Quản trị viên" | ...
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  position: string | null;
  avatarUrl: string | null;
  provinceId: number | null;
  wardId: number | null;
  address: string | null;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: Role;
  enterpriseProfile: unknown | null;
}

// ─── Auth requests ─────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  enterpriseName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ─── Auth responses ───────────────────────────────────────────────────────────
export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ForgotPasswordResponse {
  message: string;
  statusCode: number;
}

export interface ResetPasswordResponse {
  message: string;
  statusCode: number;
}

// ─── Auth state ───────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
