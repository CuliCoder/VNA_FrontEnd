import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";

// ─── Interface thực tế từ BE ──────────────────────────────
export interface BulkApproveRequest {
  reportIds: number[];
}

export interface RejectItem {
  reportId: number;
  note: string;
}

export interface BulkRejectRequest {
  rejectItems: RejectItem[];
}


export interface DepartmentReportItem {
  reportId: number;
  enterpriseId: number;
  enterpriseName: string;
  taxCode: string;
  provinceId: number;
  wardId: number;
  periodType: "HALF_YEAR" | "YEAR";
  year: number;
  status: "REPORTING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  statusLabel: string;
}

export interface DepartmentReportListResponse {
  data: DepartmentReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentFilterOptions {
  years: number[];
  periods: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
}

export interface DepartmentReportParams {
  current?: number;
  limit?: number;
  provinceId?: number;
  wardId?: number;
  enterpriseName?: string;
  taxCode?: string;
  year?: number;
  periodType?: "HALF_YEAR" | "YEAR";
  status?: "REPORTING" | "SUBMITTED" | "APPROVED" | "REJECTED";
}

export interface GeneralSummaryResponse {
  data: any[];
  [key: string]: any;
}

export interface AccidentSummaryResponse {
  data: any[];
  [key: string]: any;
}

export const departmentService = {
  // Lấy danh sách báo cáo gửi lên Sở
  async getDepartmentReports(params: DepartmentReportParams): Promise<DepartmentReportListResponse> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.DEPARTMENTS_REPORT.LIST,
      { params }
    );
    const raw = response.data;
    // Nếu BE trả về mảng thẳng
    if (Array.isArray(raw)) {
      return {
        data: raw,
        total: raw.length,
        page: params.current ?? 1,
        limit: params.limit ?? 10,
        totalPages: 1,
      };
    }
    // Nếu BE trả về object có data[]
    return {
      data: raw.data ?? [],
      total: raw.total ?? 0,
      page: raw.page ?? params.current ?? 1,
      limit: raw.limit ?? params.limit ?? 10,
      totalPages: raw.totalPages ?? Math.max(1, Math.ceil((raw.total ?? 0) / (raw.limit ?? params.limit ?? 10))),
    };
  },

  // Lấy các tùy chọn lọc từ DB
  async getFilterOptions(): Promise<DepartmentFilterOptions> {
    const response = await apiClient.get<DepartmentFilterOptions>(
      API_ENDPOINTS.DEPARTMENTS_REPORT.FILTER
    );
    return response.data;
  },

  // Báo cáo thống kê theo phường xã (statistics-by-ward)
  async getStatisticsByWard(year: number, provinceId: number): Promise<any> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.DEPARTMENTS_REPORT.BY_WARD,
      { params: { year, provinceId } }
    );
    return response.data;
  },

  // Báo cáo tổng hợp - Phần I: Thông tin tổng quan
  async getGeneralSummary(params: { year: number; provinceId?: number; wardId?: number }): Promise<GeneralSummaryResponse> {
    const queryParams: any = { year: params.year };
    if (params.provinceId) queryParams.provinceId = params.provinceId;
    if (params.wardId) queryParams.wardId = params.wardId;
    
    const response = await apiClient.get<GeneralSummaryResponse>(
      API_ENDPOINTS.SUMMARY_REPORTS.GENERAL,
      { params: queryParams }
    );
    return response.data;
  },

  // Báo cáo tổng hợp - Phần II: Phân loại tai nạn lao động
  async getAccidentSummary(params: { year: number; provinceId?: number; wardId?: number }): Promise<AccidentSummaryResponse> {
    const queryParams: any = { year: params.year };
    if (params.provinceId) queryParams.provinceId = params.provinceId;
    if (params.wardId) queryParams.wardId = params.wardId;

    const response = await apiClient.get<AccidentSummaryResponse>(
      API_ENDPOINTS.SUMMARY_REPORTS.ACCIDENT,
      { params: queryParams }
    );
    return response.data;
  },

  // Duyệt hàng loạt
async bulkApprove(reportIds: number[]) {
  const response = await apiClient.post(
    API_ENDPOINTS.DEPARTMENTS_REPORT.BULK_APPROVE,
    {
      reportIds,
    }
  );

  return response.data;
},

// Từ chối hàng loạt
async bulkReject(rejectItems: { reportId: number; note: string }[]) {
  const response = await apiClient.post(
    API_ENDPOINTS.DEPARTMENTS_REPORT.BULK_REJECT,
    {
      rejectItems,
    }
  );

  return response.data;
},
};
