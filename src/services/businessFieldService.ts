import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { ApiResponse } from "@/types/api";

export interface BusinessField {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  parent?: Pick<BusinessField, "id" | "code" | "name"> | null;
  level: number; // 1, 2, 3, 4...
  status: boolean;
}

export interface BusinessFieldCreateRequest {
  code: string;
  name: string;
  parentId: number | null;
  status: boolean;
}

export interface BusinessFieldUpdateRequest {
  code?: string;
  name?: string;
  parentId?: number | null;
  status?: boolean;
}

export const businessFieldService = {
  getBusinessFields: async (params?: string): Promise<BusinessField[]> => {
    const res = await apiClient.get<BusinessField[]>(
      API_ENDPOINTS.BUSINESS_FIELDS.ROOT + (params || "")
    );
    return res.data;
  },

  createBusinessField: async (payload: BusinessFieldCreateRequest) => {
    return await apiClient.post<ApiResponse<BusinessField>>(
      API_ENDPOINTS.BUSINESS_FIELDS.ROOT,
      payload
    );
  },

  updateBusinessField: async (id: number, payload: BusinessFieldUpdateRequest) => {
    return await apiClient.patch<ApiResponse<BusinessField>>(
      API_ENDPOINTS.BUSINESS_FIELDS.DETAIL(id),
      payload
    );
  },

  updateBusinessFieldStatus: async (id: number, status: boolean) => {
    return await apiClient.patch<ApiResponse<BusinessField>>(
      API_ENDPOINTS.BUSINESS_FIELDS.DETAIL(id),
      { status }
    );
  },

  deleteBusinessFields: async (ids: number[]) => {
    await Promise.all(ids.map(id => apiClient.delete(API_ENDPOINTS.BUSINESS_FIELDS.DETAIL(id))));
  },

  deleteBusinessField: async (id: number) => {
    return await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.BUSINESS_FIELDS.DETAIL(id)
    );
  },

  importBusinessFields: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.BUSINESS_FIELDS.IMPORT,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};
