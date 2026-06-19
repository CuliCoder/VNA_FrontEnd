import { User } from "./auth";

export interface UserListParams {
  page?: number;
  limit?: number;
  fullName?: string;
  username?: string;
  email?: string;
  position?: string;
  roleId?: number;
  isActive?: boolean | string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleId: number;
  birthDate?: string | null;
  gender?: string | null;
  position?: string | null;
  provinceId?: number | null;
  wardId?: number | null;
  address?: string | null;
  isActive?: boolean;
  avatarUrl?: string | null;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  roleId?: number;
  birthDate?: string | null;
  gender?: string | null;
  position?: string | null;
  phone?: string | null;
  provinceId?: number | null;
  wardId?: number | null;
  address?: string | null;
  isActive?: boolean;
  avatarUrl?: string | null;
}

export interface ImportPreviewRow {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  data: any;
}

export interface ImportPreviewResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  results: ImportPreviewRow[];
}
