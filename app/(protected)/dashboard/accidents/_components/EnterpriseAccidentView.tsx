"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from "@/components/common";
import { Eye, Edit2 } from "lucide-react";
import { reportService, PeriodAndReport } from "@/services/reportService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function EnterpriseAccidentView() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<PeriodAndReport[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(currentYear.toString());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchReports = async (selectedYear: string) => {
    try {
      setLoading(true);
      const res = await reportService.getPeriodsAndReports(parseInt(selectedYear));
      setData(res);
      setPage(1);
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy danh sách báo cáo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(year);
  }, [year]);

  const handleInitReport = async (periodId: number) => {
    try {
      const report = await reportService.initReport(periodId);
      router.push(`/dashboard/accidents/${report.id}`);
    } catch (error) {
       toast({
        title: "Lỗi",
        description: "Không thể khởi tạo báo cáo",
        variant: "destructive",
      });
    }
  };

  const enterpriseName = (user?.enterpriseProfile as any)?.name || "N/A";
  const taxCode = (user?.enterpriseProfile as any)?.taxCode || "N/A";

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedData = data.slice((page - 1) * limit, page * limit);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Báo cáo định kỳ Tai nạn lao động</h1>
        <select 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const y = currentYear - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-auto">
          <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">Thao tác</TableHead>
            <TableHead>Tên doanh nghiệp</TableHead>
            <TableHead>Mã số thuế</TableHead>
            <TableHead>Kỳ báo cáo</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">Không có dữ liệu cho năm {year}</TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item) => {
              const status = item.report ? item.report.status : null;
              const isDraft = status === "DRAFT";
              return (
                <TableRow key={item.period.id}>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      {item.report && (
                        <button 
                          title="Xem báo cáo"
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          onClick={() => router.push(`/dashboard/accidents/${item.report!.id}?mode=view`)}
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {(isDraft || status === "REJECTED" || !item.report) && (
                        <button 
                          title={!item.report ? "Khai báo báo cáo" : "Sửa báo cáo"}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            if (!item.report) {
                              handleInitReport(item.period.id);
                            } else {
                              router.push(`/dashboard/accidents/${item.report.id}`);
                            }
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800">{enterpriseName}</TableCell>
                  <TableCell className="text-gray-600">{taxCode}</TableCell>
                  <TableCell className="text-gray-700">
                    {item.period.periodType === "SIX_MONTH" ? "6 tháng" : "Cả năm"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status === "DRAFT" ? "bg-gray-400" :
                        status === "SUBMITTED" ? "bg-blue-500" :
                        status === "REJECTED" ? "bg-red-500" :
                        "bg-transparent border border-gray-300"
                      }`} />
                      <span className={`text-sm ${
                        status === "DRAFT" ? "text-gray-500" :
                        status === "SUBMITTED" ? "text-blue-600 font-medium" :
                        status === "REJECTED" ? "text-red-600 font-medium" :
                        "text-gray-400"
                      }`}>
                        {status === "DRAFT" ? "Đang báo cáo" :
                         status === "SUBMITTED" ? "Đã tiếp nhận" :
                         status === "REJECTED" ? "Bị trả lại (cần sửa và nộp lại)" :
                         "Chờ báo cáo (chưa khởi tạo)"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
        </div>

        <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/30 shrink-0 pr-4">
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
            className="border-none bg-transparent py-2.5 px-0"
          />
        </div>
      </div>
    </div>
  );
}
