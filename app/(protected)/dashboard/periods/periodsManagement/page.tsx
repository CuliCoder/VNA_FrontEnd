"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Save, Calendar } from "lucide-react";
import {
  reportPeriodsService,
  ReportPeriod,
  CreateReportPeriodDto,
  GetReportPeriodsParams,
  UpdateReportPeriodDto,
} from "@/services/reportPeriodsService";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Pagination,
  Modal
} from "@/components/common";

// ─── Types ───────────────────────────────────────────────────────────────────
type PeriodType = "HALF_YEAR" | "YEAR";
type StatusType = "OPEN" | "CLOSED";

interface FormState {
  reportName: string;
  year: string;
  periodType: PeriodType | "";
  startDate: string;
  endDate: string;
  status: StatusType;
}

const defaultForm: FormState = {
  reportName: "",
  year: new Date().getFullYear().toString(),
  periodType: "",
  startDate: "",
  endDate: "",
  status: "OPEN",
};

const PERIOD_LABELS: Record<PeriodType, string> = {
  HALF_YEAR: "6 tháng",
  YEAR: "Cả năm",
};

// ─── Utility ─────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function toDDMMYYYY(date: string): string {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportConfigPage() {
  const { toast } = useToast();

  // Filter state
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Data
  const [data, setData] = useState<ReportPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [currentId, setCurrentId] = useState<number | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
  try {
    setLoading(true);

    const params: GetReportPeriodsParams = {
      current : page,
      limit,
    };

    if (filterYear) params.year = Number(filterYear);
    if (filterName) params.search = filterName;
    if (filterPeriod) params.periodType = filterPeriod as "HALF_YEAR" | "YEAR";
    if (filterStatus) params.status = filterStatus as "OPEN" | "CLOSED";
    if (filterStartDate) params.startDate = toDDMMYYYY(filterStartDate);
    if (filterEndDate) params.endDate = toDDMMYYYY(filterEndDate);

    const result = await reportPeriodsService.getReportPeriods(params);

    setData(result.data);
    setTotal(result.total);
    setTotalPages(result.totalPages);
  } catch (err) {
    setData([]);
    setTotal(0);
    setTotalPages(1);
    toast({
      title: "Lỗi",
      description: "Không thể tải danh sách kỳ báo cáo",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}, [
  page,
  limit,
  filterYear,
  filterName,
  filterPeriod,
  filterStatus,
  filterStartDate,
  filterEndDate,
  toast,
]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Modal Actions ──────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setMode("create");
    setForm({ ...defaultForm });
    setErrors({});
    setCurrentId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: ReportPeriod) => {
    setMode("edit");
    setForm({
      reportName: "Báo cáo tai nạn lao động",
      year: item.year.toString(),
      periodType: item.periodType,
      startDate: item.startDate ? item.startDate.substring(0, 10) : "",
      endDate: item.endDate ? item.endDate.substring(0, 10) : "",
      status: item.status,
    });
    setErrors({});
    setCurrentId(item.id);
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.reportName.trim()) errs.reportName = "Vui lòng nhập tên báo cáo";
    if (!form.year || isNaN(Number(form.year))) errs.year = "Vui lòng nhập năm hợp lệ";
    if (!form.periodType) errs.periodType = "Vui lòng chọn kỳ báo cáo";
    if (!form.startDate) errs.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) errs.endDate = "Vui lòng chọn ngày kết thúc";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      if (mode === "create") {
        const dto: CreateReportPeriodDto = {
          reportName: form.reportName,
          year: Number(form.year),
          periodType: form.periodType as "HALF_YEAR" | "YEAR",
          startDate: toDDMMYYYY(form.startDate),
          endDate: toDDMMYYYY(form.endDate),
          status: form.status,
        };

        await reportPeriodsService.createReportPeriod(dto);

        toast({
          title: "Thành công",
          description: "Đã thêm kỳ báo cáo mới",
        });
      } else if (currentId) {
        const dto: UpdateReportPeriodDto = {
          startDate: toDDMMYYYY(form.startDate),
          endDate: toDDMMYYYY(form.endDate),
          status: form.status,
        };

        await reportPeriodsService.updateReportPeriod(currentId, dto);

        toast({
          title: "Thành công",
          description: "Đã cập nhật kỳ báo cáo",
        });
      }

      fetchData();
      setShowModal(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể lưu kỳ báo cáo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  // ─── Toggle Status ───────────────────────────────────────────────────────────
  const handleToggleStatus = async (item: ReportPeriod) => {
    try {
      setData((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? { ...p, status: p.status === "OPEN" ? "CLOSED" : "OPEN" }
            : p
        )
      );
      console.log("Toggling status for report period ID:", item.id, "Current status:", item.status);
      await reportPeriodsService.toggleStatus(
        item.id,
        item.status === "OPEN" ? "CLOSED" : "OPEN"
      );
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái" });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
      fetchData(); // rollback
    }
  };

  // ─── Client-side filter ─────────────────────────────────────────────────────
  const field = (key: keyof FormState) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* 🟢 Header 🟢 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách cấu hình báo cáo
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* 🟢 Table Card 🟢 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
        {/* Table */}
        <div className="flex-1 overflow-auto">
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">Thao tác</TableHead>
                <TableHead className="w-[100px]">Năm báo cáo</TableHead>
                <TableHead>Tên báo cáo</TableHead>
                <TableHead className="w-[140px]">Kỳ báo cáo</TableHead>
                <TableHead className="w-[150px]">Thời gian bắt đầu</TableHead>
                <TableHead className="w-[150px]">Thời gian kết thúc</TableHead>
                <TableHead className="w-[130px]">Trạng thái</TableHead>
              </TableRow>

              {/* Filter Row */}
              <TableRow className="bg-gray-50/50">
                <TableCell></TableCell>
                <TableCell className="p-2">
                  <input
                    type="number"
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Năm"
                    value={filterYear}
                    onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <input
                    type="text"
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Tìm tên..."
                    value={filterName}
                    onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <select
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={filterPeriod}
                    onChange={(e) => { setFilterPeriod(e.target.value); setPage(1); }}
                  >
                    <option value="">Tất cả</option>
                    <option value="HALF_YEAR">6 tháng</option>
                    <option value="YEAR">Cả năm</option>
                  </select>
                </TableCell>
                <TableCell className="p-2">
                  <input
                    type="date"
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={filterStartDate}
                    onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <input
                    type="date"
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={filterEndDate}
                    onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <select
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  >
                    <option value="">Tất cả</option>
                    <option value="OPEN">Mở</option>
                    <option value="CLOSED">Đóng</option>
                    <option value="DRAFT">Bản nháp</option>
                  </select>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </TableCell>
                    <TableCell className="text-gray-700">{item.year}</TableCell>
                    <TableCell className="font-medium text-gray-800">{item.reportName}</TableCell>
                    <TableCell className="text-gray-600">
                      {PERIOD_LABELS[item.periodType] ?? item.periodType}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(item.startDate)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(item.endDate)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`w-10 h-5 rounded-full relative transition-all duration-200 focus:outline-none ${item.status === "OPEN" ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        title={item.status === "OPEN" ? "Mở" : "Đóng"}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white shadow absolute top-0.5 transition-transform duration-200 ${item.status === "OPEN" ? "translate-x-5" : "translate-x-0.5"
                            }`}
                        />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            
          </Table>
          
        </div>

        {/* 🟢 Footer / Pagination 🟢 */}
        <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/30 shrink-0 pr-4">
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
            className="border-none bg-transparent py-2.5 px-0"
          />
        </div>
      </div>

      {/* 🟢 Modal 🟢 */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={mode === "create" ? "Thêm mới kỳ báo cáo" : "Chỉnh sửa kỳ báo cáo"}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
              Lưu
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          {/* Tên báo cáo */}

          {/* Tên báo cáo */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5 font-medium">
              Tên báo cáo <span className="text-red-500">*</span>
            </label>

            {mode === "create" ? (
              <>
                <input
                  type="text"
                  placeholder="Nhập tên báo cáo"
                  className={`w-full h-10 border ${errors.reportName ? "border-red-400" : "border-gray-300"
                    } rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  {...field("reportName")}
                />
                {errors.reportName && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.reportName}
                  </p>
                )}
              </>
            ) : (
              <input
                type="text"
                value={form.reportName}
                disabled
                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            )}
          </div>

          {/* Năm + Kỳ báo cáo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">
                Năm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  disabled={mode === "edit"}
                  className={`w-full h-10 border ${errors.year ? "border-red-400" : "border-gray-300"} rounded-md px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  placeholder="YYYY"
                  {...field("year")}
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.year && <p className="text-red-500 text-xs mt-1.5">{errors.year}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">
                Kỳ báo cáo <span className="text-red-500">*</span>
              </label>
              <select
                disabled={mode === "edit"}
                className={`w-full h-10 border ${errors.periodType ? "border-red-400" : "border-gray-300"} rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
                {...field("periodType")}
              >
                <option value="">Chọn kỳ...</option>
                <option value="HALF_YEAR">6 tháng</option>
                <option value="YEAR">Cả năm</option>
              </select>
              {errors.periodType && <p className="text-red-500 text-xs mt-1.5">{errors.periodType}</p>}
            </div>
          </div>

          {/* Ngày bắt đầu + Ngày kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full h-10 border ${errors.startDate ? "border-red-400" : "border-gray-300"} rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
                {...field("startDate")}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1.5">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full h-10 border ${errors.endDate ? "border-red-400" : "border-gray-300"} rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
                {...field("endDate")}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1.5">{errors.endDate}</p>}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5 font-medium">Trạng thái</label>
            <select
              className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              {...field("status")}
            >
              <option value="OPEN">Mở</option>
              <option value="CLOSED">Đóng</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}