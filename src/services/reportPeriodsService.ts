import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";

export interface ReportPeriod {
  id: number;
  reportName: string;
  year: number;
  periodType: "HALF_YEAR" | "YEAR";
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSED";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReportPeriodDto {
  reportName: string;
  year: number;
  periodType: "HALF_YEAR" | "YEAR";
  startDate: string;
  endDate: string;
  status?: "OPEN" | "CLOSED";
}

export interface UpdateReportPeriodDto 
{
  startDate: string;
  endDate: string;
  status?: "OPEN" | "CLOSED";
}

export interface GetReportPeriodsParams {
  year?: number;
  search?: string;
  periodType?: "HALF_YEAR" | "YEAR";
  status?: "OPEN" | "CLOSED"
  startDate?: string;
  endDate?: string;
  current?: number;
  limit?: number;
}

export interface ReportPeriodListResponse {
  data: ReportPeriod[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reportPeriodsService = {
  async getReportPeriods(
    params?: GetReportPeriodsParams
  ): Promise<ReportPeriodListResponse> {
    const response = await apiClient.get<ReportPeriodListResponse>(
      API_ENDPOINTS.REPORT_PERIODS.ROOT,
      { params }
    );

    return response.data;
  },

  async getReportPeriodDetail(id: number): Promise<ReportPeriod> {
    const response = await apiClient.get<ReportPeriod>(
      API_ENDPOINTS.REPORT_PERIODS.DETAIL(id)
    );
    return response.data;
  },

  async createReportPeriod(data: CreateReportPeriodDto): Promise<ReportPeriod> {
    const response = await apiClient.post<ReportPeriod>(
      API_ENDPOINTS.REPORT_PERIODS.ROOT,
      data
    );
    return response.data;
  },

  async updateReportPeriod(id: number, data: UpdateReportPeriodDto): Promise<ReportPeriod> {
    const response = await apiClient.put<ReportPeriod>(
      API_ENDPOINTS.REPORT_PERIODS.DETAIL(id),
      data
    );
    return response.data;
  },

  async toggleStatus(
  id: number,
  status: "OPEN" | "CLOSED"
): Promise<ReportPeriod> {
  const response = await apiClient.patch<ReportPeriod>(
    API_ENDPOINTS.REPORT_PERIODS.STATUS(id),
    { status }
  );

  return response.data;
}
};
