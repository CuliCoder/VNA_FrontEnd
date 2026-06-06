import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";
import type { ApiResponse } from "@/types/api";

export interface BusinessProfileRequest {
  businessName: string;
  taxCode: string;
  businessType: string;
  mainBusinessLine: string;
  licenseDate: string;
  provinceRegistration: string;
  wardRegistration: string;
  addressRegistration: string;
  foreignName?: string;
  email: string;
  phone?: string;
  provinceOperation?: string;
  wardOperation?: string;
  addressOperation?: string;
  representativeName?: string;
  representativePhone?: string;
}

export const businessService = {
  createBusiness: async (payload: BusinessProfileRequest): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(API_ENDPOINTS.BUSINESS.CREATE, payload);
  }
};
