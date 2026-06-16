import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { ApiResponse } from "@/types/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EnterpriseDocumentPayload {
  documentName: string;
  documentType: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

export interface BusinessProfileRequest {
  name: string;
  taxCode: string;

  licenseNumber?: string;
  licenseIssueDate?: string;

  businessTypeId: number;
  businessFieldId: number;

  provinceId?: number;
  wardId?: number;
  registeredAddress?: string;

  provinceIdActivity?: number;
  wardIdActivity?: number;
  operatingAddress?: string;

  englishName?: string;

  email: string;
  officePhone?: string;

  representativeName?: string;
  representativePhone?: string;

  documents?: EnterpriseDocumentPayload[];
}

export interface EnterpriseDocument {
  documentName: string;
  documentType: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

export interface Enterprise {
  id: number;
  taxCode: string;

  licenseNumber: string | null;
  licenseIssueDate: Date | null;

  name: string;
  englishName: string | null;

  businessTypeId: number;
  businessFieldId: number;

  provinceId: number | null;
  wardId: number | null;

  provinceIdActivity: number | null;
  wardIdActivity: number | null;

  registeredAddress: string | null;
  operatingAddress: string | null;

  email: string | null;
  officePhone: string | null;

  representativeName: string | null;
  representativePhone: string | null;

  status: "APPROVED" | "PENDING" | "REJECTED";

  approvedAt: string | null;
  approvedBy: number | null;
  rejectReason: string | null;

  createdAt: string;
  updatedAt: string;

  user: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    isActive: boolean;
  };

  businessType: {
    id: number;
    code: string;
    name: string;
    status: boolean;
  };

  businessField: {
    id: number;
    code: string;
    name: string;
    parentId: number | null;
    level: number;
    status: boolean;
  };

  documents: EnterpriseDocument[];

  approver: {
    id: number;
    username: string;
    fullName: string;
  } | null;
}

export interface EnterpriseListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface EnterpriseListResponse {
  data: Enterprise[];
  total: number;
  page: number;
  limit: number;
}

export interface ChangePasswordRequest {
  username: string;
  newPassword: string;
}

export type EnterpriseStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED";

export interface CreateEnterpriseResponse {
  enterprise: Enterprise;
  account: {
    username: string;
    password: string;
  };
}

// ─── Service ───────────────────────────────────────────────────────────────

export const businessService = {
  /** Tạo mới doanh nghiệp */
  createBusiness: async (
    payload: BusinessProfileRequest
  ): Promise<CreateEnterpriseResponse> => {
    const res = await apiClient.post<CreateEnterpriseResponse>(
      API_ENDPOINTS.ENTERPRISES.CREATE,
      payload
    );

    return res.data;
  },

  /** Danh sách doanh nghiệp */
  getEnterprises: async (
    params?: EnterpriseListParams
  ): Promise<EnterpriseListResponse> => {
    const res = await apiClient.get<ApiResponse<EnterpriseListResponse>>(
      API_ENDPOINTS.ENTERPRISES.LIST_ENTERPRISES,
      { params }
    );

    const raw = res.data.data ?? res.data;

    if (Array.isArray(raw)) {
      return {
        data: raw as Enterprise[],
        total: raw.length,
        page: 1,
        limit: 10,
      };
    }

    return raw as EnterpriseListResponse;
  },

  /** Chi tiết doanh nghiệp */
  getEnterpriseById: async (
    id: number
  ): Promise<Enterprise> => {
    const res = await apiClient.get<ApiResponse<Enterprise>>(
      API_ENDPOINTS.ENTERPRISES.DETAIL(id)
    );

    return (res.data.data ?? res.data) as Enterprise;
  },

  /** Cập nhật thông tin doanh nghiệp */
  updateEnterprise: async (
    id: number,
    payload: Partial<BusinessProfileRequest>
  ): Promise<Enterprise> => {
    const res = await apiClient.patch<Enterprise>(
      API_ENDPOINTS.ENTERPRISES.DETAIL(id),
      payload
    );

    return res.data;
  },

  /** Xóa 1 doanh nghiệp */
  deleteEnterprise: async (
    id: number
  ): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.ENTERPRISES.DETAIL(id)
    );
  },

  /** Xóa nhiều doanh nghiệp */
  deleteEnterprises: async (
    ids: number[]
  ): Promise<void> => {
    await Promise.all(
      ids.map((id) => businessService.deleteEnterprise(id))
    );
  },

  /** Đổi mật khẩu */
  changePassword: async (
    payload: ChangePasswordRequest
  ): Promise<{message: string}> => {
    const res = await apiClient.post<{message: string}>(
      API_ENDPOINTS.ENTERPRISES.CHANGE_PASSWORD,
      payload
    );

    return res.data;
  },

  /** Duyệt / từ chối / chờ duyệt */
  updateStatus: async (
    id: number,
    status: EnterpriseStatus
  ): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(
      API_ENDPOINTS.ENTERPRISES.CHANGE_STATUS(id),
      { status }
    );
  },

  uploadFile: async (
    file: File,
    taxCode?: string
  ): Promise<{ url: string; fileName: string; mimeType: string; fileSize: number; documentName?: string; documentType?: string; filePath?: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<{ url: string; fileName: string; mimeType: string; fileSize: number }>>(
      API_ENDPOINTS.ENTERPRISES.UPLOAD,
      formData,
      {
        params: taxCode ? { taxCode } : undefined,
      }
    );

    // Some components expect `filePath` mapping
    const data = res.data.data ?? res.data;
    return {
      ...data,
      filePath: data.url,
    };
  },

  /** Upload nhiều tài liệu (gọi lần lượt uploadFile) */
  uploadFiles: async (
    files: File[],
    taxCode?: string
  ): Promise<any[]> => {
    return await Promise.all(
      files.map((file) => businessService.uploadFile(file, taxCode))
    );
  },

  /** Xóa file tài liệu */
  deleteFile: async (filePath: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.ENTERPRISES.UPLOAD,
      { params: { filePath } }
    );
  },

  /** Nhập doanh nghiệp từ file */
  importEnterprises: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.ENTERPRISES.IMPORT,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};