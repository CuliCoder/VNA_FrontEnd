"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Pagination
} from "@/components/common";
import { departmentService, DepartmentReportItem } from "@/services/departmentService";
import { provincesService } from "@/services/provincesService";
import { useToast } from "@/hooks/use-toast";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

import { Modal } from "@/components/common/Modal";
interface Province {
  name: string;
  code: number;
}

interface Ward {
  name: string;
  code: number;
}

// ─── Status helpers ───────────────────────────────────────────────────────────
function getStatusLabel(status: string, statusLabel?: string) {
  if (statusLabel) return statusLabel;
  switch (status) {
    case "DRAFT": return "Đang báo cáo";
    case "SUBMITTED": return "Đã nộp";
    case "APPROVED": return "Đã tiếp nhận";
    case "REJECTED": return "Bị trả lại";
    default: return "Chờ báo cáo";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "DRAFT": return "text-gray-500";
    case "SUBMITTED": return "text-blue-500 font-medium";
    case "APPROVED": return "text-green-600 font-medium";
    case "REJECTED": return "text-red-600 font-medium";
    default: return "text-gray-400";
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case "DRAFT": return "bg-gray-400";
    case "SUBMITTED": return "bg-blue-500";
    case "APPROVED": return "bg-green-500";
    case "REJECTED": return "bg-red-500";
    default: return "bg-transparent border border-gray-300";
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PeriodsViewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  // Filter options from API
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);

  // Active filters
  const [year, setYear] = useState<string>(currentYear.toString());
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  // Province / Ward lists
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  // Table lists
  const [reports, setReports] = useState<DepartmentReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);


  // Inline table filters
  const [filterName, setFilterName] = useState("");
  const [filterTax, setFilterTax] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<
    "HALF_YEAR" | "YEAR" | ""
  >("");
  const [filterStatus, setFilterStatus] = useState<
    "REPORTING" | "SUBMITTED" | "APPROVED" | "REJECTED" | ""
  >("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Summary Report Modal
  const [showSummary, setShowSummary] = useState(false);

  const totalPagesComputed = Math.max(1, Math.ceil(total / limit));

  //state checkbox 
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [showRejectModal, setShowRejectModal] = useState(false);
  // Map<reportId, note> — một lý do riêng cho từng báo cáo
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>({});

  const [submitting, setSubmitting] = useState(false);
  // ─── Load initial filters & locations ───────────────────────────────────────
  useEffect(() => {
    // Load filter options
    departmentService.getFilterOptions()
      .then((opts) => {
        if (opts && opts.years && opts.years.length > 0) {
          setAvailableYears(opts.years);
          // Set to latest year if current is not in list
          if (!opts.years.includes(Number(year))) {
            setYear(opts.years[0].toString());
          }
        }
      })
      .catch(() => { });

    // Load provinces
    provincesService.getProvinces()
      .then(setProvinces)
      .catch(() => { })
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    setLoadingWards(true);
    provincesService.getWards(Number(selectedProvince))
      .then(setWards)
      .catch(() => { })
      .finally(() => setLoadingWards(false));
  }, [selectedProvince]);
  //hàm cho checkbox 
  const selectableReports = reports.filter(
    r => r.status === "SUBMITTED"
  );

  const isAllSelected =
    selectableReports.length > 0 &&
    selectableReports.every(r => selectedIds.has(r.reportId));

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);

      if (next.has(id))
        next.delete(id);
      else
        next.add(id);

      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(selectableReports.map(r => r.reportId))
      );
    }
  };

  // gọi api tiếp nhận/từ chối báo cáo
  const handleBulkApprove = async () => {
    try {
      setSubmitting(true);

      await departmentService.bulkApprove(
        Array.from(selectedIds)
      );

      toast({
        title: "Thành công",
        description: "Đã tiếp nhận các báo cáo."
      });

      setSelectedIds(new Set());

      fetchReports();
    } finally {
      setSubmitting(false);
    }
  };
  // Mở modal từ chối: khởi tạo map lý do rỗng cho mỗi báo cáo được chọn
  const handleOpenRejectModal = () => {
    const init: Record<number, string> = {};
    selectedIds.forEach(id => { init[id] = ""; });
    setRejectReasons(init);
    setShowRejectModal(true);
  };

  const handleBulkReject = async () => {
    // Kiểm tra không được để trống bất kỳ lý do nào
    const emptyIds = Array.from(selectedIds).filter(
      id => !rejectReasons[id]?.trim()
    );

    if (emptyIds.length > 0) {
      toast({
        title: "Thiếu lý do",
        description: "Vui lòng nhập lý do từ chối cho tất cả doanh nghiệp.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      await departmentService.bulkReject(
        Array.from(selectedIds).map(id => ({
          reportId: id,
          note: rejectReasons[id].trim()
        }))
      );

      toast({
        title: "Thành công",
        description: "Đã từ chối các báo cáo."
      });

      setShowRejectModal(false);
      setRejectReasons({});
      setSelectedIds(new Set());

      fetchReports();
    } finally {
      setSubmitting(false);
    }
  };
  // ─── Fetch List ─────────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDepartmentReports({
        current: page,
        limit,
        year: Number(year),
        provinceId: selectedProvince ? Number(selectedProvince) : undefined,
        wardId: selectedWard ? Number(selectedWard) : undefined,
        enterpriseName: filterName.trim() || undefined,
        taxCode: filterTax.trim() || undefined,
        periodType: filterPeriod || undefined,
        status: filterStatus || undefined,
      });
      setReports(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages ?? Math.max(1, Math.ceil(res.total / limit)));

      // Tự động cập nhật danh sách năm từ dữ liệu trả về (không cần filter-options)
      if (res.data.length > 0) {
        const yearsFromData = Array.from(new Set(res.data.map((r) => r.year))).sort((a, b) => b - a);
        setAvailableYears((prev) => {
          const merged = Array.from(new Set([...prev, ...yearsFromData])).sort((a, b) => b - a);
          return merged;
        });
      }
    } catch (err: any) {
      setReports([]);
      setTotal(0);
      setTotalPages(1);
      toast({
        title: "Lỗi tải báo cáo",
        description: "Không thể lấy danh sách báo cáo từ hệ thống.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, year, selectedProvince, selectedWard, filterName, filterTax, filterPeriod, filterStatus, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ─── Open Summary Report Modal ──────────────────────────────────────────────
  const handleOpenSummary = () => {
    let url = `/dashboard/periods/summary?year=${year}`;

    if (selectedProvince) {
      url += `&provinceId=${selectedProvince}`;
    }

    if (selectedWard) {
      url += `&wardId=${selectedWard}`;
    }

    router.push(url);
  };


  return (
    <div className="flex flex-col h-full">
      {/* 🟢 Header 🟢 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-800 mb-3">
            Báo cáo định kỳ Tai nạn lao động
          </h1>
          <div className="flex items-center gap-3">
            {/* Year selector */}
            <div className="relative inline-block">
              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); setPage(1); }}
                className="h-9 pl-3 pr-8 border border-gray-300 rounded text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px]"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Province selector */}
            <div className="relative inline-block">
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedWard("");
                  setPage(1);
                }}
                disabled={loadingProvinces}
                className="h-9 pl-3 pr-8 border border-gray-300 rounded text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px] disabled:bg-gray-50"
              >
                <option value="">Tất cả Tỉnh/Thành</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Ward selector */}
            <div className="relative inline-block">
              <select
                value={selectedWard}
                onChange={(e) => { setSelectedWard(e.target.value); setPage(1); }}
                disabled={!selectedProvince || loadingWards}
                className="h-9 pl-3 pr-8 border border-gray-300 rounded text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px] disabled:bg-gray-50"
              >
                <option value="">Tất cả Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mt-1 flex flex-col items-start gap-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenSummary}
            disabled={!selectedProvince}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            Báo cáo tổng hợp
          </Button>

          {!selectedProvince && (
            <span className="text-xs text-red-500">
              Vui lòng chọn tỉnh/thành phố.
            </span>
          )}
        </div>
      </div>

      {/* 🟢 Table Card 🟢 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="w-[100px] text-center">Thao tác</TableHead>
                <TableHead>Tên doanh nghiệp</TableHead>
                <TableHead className="w-[180px]">Mã số thuế</TableHead>
                <TableHead className="w-[150px]">Kỳ báo cáo</TableHead>
                <TableHead className="w-[180px]">Trạng thái</TableHead>
              </TableRow>

              {/* Filter Row */}
              <TableRow className="bg-gray-50/50">
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="p-2">
                  <input
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Tìm tên..."
                    value={filterName}
                    onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <input
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="MST..."
                    value={filterTax}
                    onChange={(e) => { setFilterTax(e.target.value); setPage(1); }}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <select
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={filterPeriod}
                    onChange={(e) => {
                      setFilterPeriod(
                        e.target.value as "" | "HALF_YEAR" | "YEAR"
                      );
                      setPage(1);
                    }}
                  >
                    <option value="">Tất cả</option>
                    <option value="HALF_YEAR">6 tháng</option>
                    <option value="YEAR">Cả năm</option>
                  </select>
                </TableCell>
                <TableCell className="p-2">
                  <select
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(
                        e.target.value as
                        | ""
                        | "REPORTING"
                        | "SUBMITTED"
                        | "APPROVED"
                        | "REJECTED"
                      );

                      setPage(1);
                    }}
                  >
                    <option value="">Tất cả</option>
                    <option value="REPORTING">Đang báo cáo</option>
                    <option value="REJECTED"> Từ chối</option>
                    <option value="SUBMITTED">Chờ tiếp nhận</option>
                    <option value="APPROVED">Đã tiếp nhận</option>
                  </select>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                    Không có dữ liệu báo cáo gửi lên
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((item) => {
                  const periodTypeLabel =
                    item.periodType === "YEAR"
                      ? "Cả năm"
                      : item.periodType === "HALF_YEAR"
                        ? "6 tháng"
                        : item.periodType;

                  return (
                    <TableRow key={item.reportId} className="group">
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          disabled={item.status !== "SUBMITTED"}
                          checked={selectedIds.has(item.reportId)}
                          onChange={() => toggleSelect(item.reportId)}
                          className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          title="Xem chi tiết"
                          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          onClick={() =>
                            router.push(`/dashboard/accidents/${item.reportId}?mode=view`)
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {item.enterpriseName || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600">{item.taxCode || "—"}</TableCell>
                      <TableCell className="text-gray-600">
                        {periodTypeLabel}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(item.status)}`} />
                          <span className={`text-sm ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status, item.statusLabel)}
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
      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => {
          if (!submitting) {
            setShowRejectModal(false);
            setRejectReasons({});
          }
        }}
        title="Từ chối báo cáo"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReasons({});
              }}
              disabled={submitting}
            >
              Hủy
            </Button>

            <Button
              variant="danger"
              onClick={handleBulkReject}
              isLoading={submitting}
            >
              Xác nhận từ chối
            </Button>
          </>
        }
      >
        {/* Header mô tả */}
        <p className="text-sm text-gray-500 mb-4">
          Nhập lý do từ chối cho từng doanh nghiệp bên dưới.{" "}
          <span className="text-red-500 font-medium">Tất cả lý do đều bắt buộc.</span>
        </p>

        {/* Danh sách doanh nghiệp */}
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {reports
            .filter(r => selectedIds.has(r.reportId))
            .map((r, idx) => {
              const note = rejectReasons[r.reportId] ?? "";
              const isEmpty = note.trim() === "";
              return (
                <div
                  key={r.reportId}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  {/* Thông tin doanh nghiệp */}
                  <div className="flex items-start gap-2 mb-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {r.enterpriseName || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        MST: {r.taxCode || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Textarea lý do */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Lý do từ chối <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 ${
                        isEmpty
                          ? "border-red-300 bg-red-50/40"
                          : "border-gray-300 bg-white"
                      }`}
                      placeholder="Nhập lý do từ chối..."
                      value={note}
                      onChange={e =>
                        setRejectReasons(prev => ({
                          ...prev,
                          [r.reportId]: e.target.value
                        }))
                      }
                    />
                    {isEmpty && (
                      <p className="text-xs text-red-500 mt-1">
                        Vui lòng nhập lý do từ chối.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </Modal>
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 rounded-xl border bg-white shadow-2xl px-4 py-3">

            <span className="text-sm font-medium whitespace-nowrap">
              Đã chọn {selectedIds.size} báo cáo
            </span>

            <Button
              onClick={handleBulkApprove}
              disabled={submitting}
            >
              Tiếp nhận
            </Button>

            <Button
              variant="danger"
              onClick={handleOpenRejectModal}
              disabled={submitting}
            >
              Từ chối
            </Button>

            <Button
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
            >
              Bỏ chọn
            </Button>

          </div>

        </div>
      )}
    </div>
  );
}
