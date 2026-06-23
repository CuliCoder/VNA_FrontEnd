import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";

export interface Period {
  id: number;
  year: number;
  periodType: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportBrief {
  id: number;
  reportPeriodId: number;
  status: string;
  submittedAt: string | null;
  updatedAt: string;
}

export interface PeriodAndReport {
  period: Period;
  report: ReportBrief | null;
}

export interface ReportCategory {
  id: number;
  code: string;
  name: string;
  level: number;
  parentId: number | null;
}

export interface ReportCategoriesResponse {
  accidentCauses: ReportCategory[];
  injuryFactors: ReportCategory[];
  occupations: ReportCategory[];
  injuryTypes: ReportCategory[];
}

export const reportService = {
  async getCategories(): Promise<ReportCategoriesResponse> {
    const response = await apiClient.get<ReportCategoriesResponse>(
      API_ENDPOINTS.REPORTS.CATEGORIES
    );
    return response.data;
  },

  async getPeriodsAndReports(year?: number): Promise<PeriodAndReport[]> {
    const params = year ? { year } : {};
    const response = await apiClient.get<PeriodAndReport[]>(
      API_ENDPOINTS.REPORTS.LIST,
      { params }
    );
    return response.data;
  },

  async initReport(periodId: number): Promise<any> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.REPORTS.INIT(periodId)
    );
    return response.data;
  },

  async getReportDetails(id: number): Promise<any> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.REPORTS.DETAIL(id)
    );
    return response.data;
  },

  async updateReport(id: number, data: any): Promise<any> {
    const response = await apiClient.put<any>(
      API_ENDPOINTS.REPORTS.UPDATE(id),
      data
    );
    return response.data;
  },

  async uploadReportFile(id: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<any>(
      API_ENDPOINTS.REPORTS.UPLOAD(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async submitReport(id: number): Promise<any> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.REPORTS.SUBMIT(id)
    );
    return response.data;
  },
};
