import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface BusinessType {
  id: number;
  code: string;
  name: string;
  status: boolean;
}

export interface BusinessTypeCreateRequest {
  code: string;
  name: string;
  status: boolean;
}

export const businessTypeService = {
  getBusinessTypes: async (): Promise<BusinessType[]> => {
    const res = await apiClient.get<BusinessType[]>(
      API_ENDPOINTS.BUSINESS_TYPES.ROOT
    );

    return res.data;
  },

  createBusinessType: async (payload: BusinessTypeCreateRequest) => {
    return await apiClient.post<ApiResponse<BusinessType>>(API_ENDPOINTS.BUSINESS_TYPES.ROOT, payload);
  },

  updateBusinessTypeStatus: async (id: number, status: boolean) => {
    return await apiClient.patch<ApiResponse<BusinessType>>(API_ENDPOINTS.BUSINESS_TYPES.DETAIL(id), { status });
  },

  deleteBusinessTypes: async (ids: number[]) => {
    await Promise.all(ids.map(id => apiClient.delete(API_ENDPOINTS.BUSINESS_TYPES.DETAIL(id))));
  }
};
