"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Upload, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BusinessTable from "./BusinessTable";
import { ViewDetailModal } from "./BusinessesModal";
import EnterpriseImportPreviewModal from "./EnterpriseImportPreviewModal";
import {
  businessService,
  Enterprise,
} from "@/services/businessService";
import { businessTypeService } from "@/services/businessTypeService";
import { businessFieldService } from "@/services/businessFieldService";
import type { ImportPreviewResult } from "@/types/adminUser";
import { 
  Button,
  DeleteConfirmModal,
  InitPasswordModal
} from "@/components/common";

export default function BusinessesView() {
  const router = useRouter();

  // ── Data state ─────────────────────────────────────────────────────────
  const [data, setData] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Modal state ────────────────────────────────────────────────────────
  const [viewTarget, setViewTarget] = useState<Enterprise | null>(null);
  const [pwdTarget, setPwdTarget] = useState<Enterprise | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetSelectionCounter, setResetSelectionCounter] = useState(0);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getEnterprises({ page, limit });
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Lỗi tải danh sách doanh nghiệp:", err);
      // Fallback mock data để UI không trống khi dev

    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleStatusChange = async (
    id: number,
    status: "APPROVED" | "PENDING" | "REJECTED"
  ) => {
    try {
      setData((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
      await businessService.updateStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật trạng thái thất bại");
      fetchData();
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.info("Đang tạo file mẫu...");

      // Lấy dữ liệu mới nhất từ DB song song
      const [businessTypes, businessFields] = await Promise.all([
        businessTypeService.getBusinessTypes(),
        businessFieldService.getBusinessFields(),
      ]);

      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Danh sách doanh nghiệp (CHỈ có header, data từ dòng 2) ──
      const headers = [
        "Tên doanh nghiệp",
        "Mã số thuế",
        "Số giấy phép",
        "Ngày cấp",
        "Loại hình kinh doanh",
        "Ngành nghề kinh doanh",
        "Mã tỉnh đăng ký",
        "Mã phường đăng ký",
        "Địa chỉ đăng ký",
        "Mã tỉnh hoạt động",
        "Mã phường hoạt động",
        "Địa chỉ hoạt động",
        "Tên tiếng nước ngoài",
        "Email",
        "Số điện thoại cơ quan",
        "Người đứng đầu",
        "Số điện thoại người đứng đầu"
      ];

      // Sheet 1 CHỈ có header — backend đọc data từ dòng 2
      const ws1 = XLSX.utils.aoa_to_sheet([headers]);
      ws1["!cols"] = [
        { wch: 40 }, 
        { wch: 18 }, 
        { wch: 40 }, 
        { wch: 28 }, 
        { wch: 28 }, 
        { wch: 28 }, 
        { wch: 50 }, 
        { wch: 36 }, 
        { wch: 24 }, 
        { wch: 30 }, 
        { wch: 28 }, 
        { wch: 50 }, 
        { wch: 36 }, 
        { wch: 24 }, 
        { wch: 30 },
        { wch: 28 },
        { wch: 50 }
      ];
      XLSX.utils.book_append_sheet(wb, ws1, "Danh sách doanh nghiệp");

      // ── Sheet 2: Hướng dẫn điền ──
      const guideData = [
        ["Cột", "Bắt buộc?", "Hướng dẫn / Ghi chú"],
        ["Tên doanh nghiệp", "✅ Bắt buộc", "Tên đầy đủ của doanh nghiệp"],
        ["Mã số thuế", "✅ Bắt buộc", "10 chữ số, không có dấu chấm/gạch ngang"],
        ["Tên tiếng Anh", "Không bắt buộc", ""],
        ["Số GPKD", "Không bắt buộc", ""],
        ["Ngày cấp GPKD", "Không bắt buộc", "Định dạng: YYYY-MM-DD (ví dụ: 2020-01-15)"],
        ["Mã loại hình kinh doanh", "✅ Bắt buộc", "Xem Sheet 'Loại hình KD' để lấy mã hợp lệ"],
        ["Mã ngành nghề kinh doanh", "✅ Bắt buộc", "Xem Sheet 'Ngành nghề KD' để lấy mã hợp lệ"],
        ["Địa chỉ ĐKKD", "✅ Bắt buộc", "Địa chỉ đăng ký kinh doanh"],
        ["Email doanh nghiệp", "✅ Bắt buộc", "Định dạng email hợp lệ"],
        ["Số điện thoại văn phòng", "Không bắt buộc", ""],
        ["Tên người đại diện", "Không bắt buộc", ""],
        ["Số điện thoại người đại diện", "Không bắt buộc", ""],
        [],
        ["⚠️ LƯU Ý QUAN TRỌNG", "", ""],
        ["", "", "• Chỉ điền dữ liệu vào Sheet 'Danh sách doanh nghiệp'"],
        ["", "", "• Không xóa dòng tiêu đề (dòng 1)"],
        ["", "", "• Bắt đầu điền từ dòng 2"],
        ["", "", "• Không thêm cột mới"],
        ["", "", `• Ví dụ mã loại hình: ${businessTypes[0]?.code ?? "N/A"} (${businessTypes[0]?.name ?? ""})`],
        ["", "", `• Ví dụ mã ngành nghề: ${businessFields[0]?.code ?? "N/A"} (${businessFields[0]?.name ?? ""})`],
      ];
      const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
      wsGuide["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 80 }];
      XLSX.utils.book_append_sheet(wb, wsGuide, "Hướng dẫn");

      // ── Sheet 3: Loại hình kinh doanh ──
      const typeSheetData = [
        ["Mã loại hình (code)", "Tên loại hình (name)"],
        ...businessTypes.map((t) => [t.code, t.name]),
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(typeSheetData);
      ws2["!cols"] = [{ wch: 30 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, ws2, "Loại hình KD");

      // ── Sheet 4: Ngành nghề kinh doanh ──
      const fieldSheetData = [
        ["Mã ngành nghề (code)", "Tên ngành nghề (name)"],
        ...businessFields.map((f) => [f.code, f.name]),
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(fieldSheetData);
      ws3["!cols"] = [{ wch: 30 }, { wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws3, "Ngành nghề KD");

      XLSX.writeFile(wb, "enterprise_import_template.xlsx");
      toast.success("Đã tải file mẫu thành công!");

    } catch (err: any) {
      toast.error(err.message || "Không thể tạo file mẫu");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      toast.info("Đang đọc file...");
      const data = await businessService.importReview(file);
      setPreviewData(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi đọc file");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    const validEnterprises = previewData.results
      .filter((r) => r.isValid)
      .map((r) => r.data);

    if (validEnterprises.length === 0) {
      toast.error("Không có dữ liệu hợp lệ để import");
      return;
    }

    setIsImporting(true);
    try {
      await businessService.importConfirm(validEnterprises);
      toast.success(`Đã import thành công ${validEnterprises.length} doanh nghiệp`);
      setPreviewData(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi import dữ liệu");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteSelected = (ids: number[]) => {
    setDeleteIds(ids);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await businessService.deleteEnterprises(deleteIds);
      setDeleteIds([]);
      // signal table to clear its local selection state
      setResetSelectionCounter((c) => c + 1);
      toast.success("Xóa thành công");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Xóa thất bại");
      console.error("Xóa thất bại:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────  // 🟢 Render 🟢
  return (
    <div className="flex flex-col h-full">
      {/* 🟢 Header 🟢 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách doanh nghiệp
        </h1>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadTemplate}
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" />
            Tải mẫu
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            {isImporting ? "Đang xử lý..." : "Import"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = "/dashboard/business/create"}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* 🟢 Table Card 🟢 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
        <BusinessTable
          data={data}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onStatusChange={handleStatusChange}
          onView={(item) => setViewTarget(item)}
          onEdit={(item) => router.push(`/dashboard/business/businesses/${item.id}/edit`)}
          onChangePassword={(item) => setPwdTarget(item)}
          onDeleteSelected={handleDeleteSelected}
          resetSelection={resetSelectionCounter}
        />
      </div>

      {/* 🟢 Modals 🟢 */}

      {/* Xóa */}
      <DeleteConfirmModal
        open={deleteIds.length > 0}
        ids={deleteIds}
        onClose={() => setDeleteIds([])}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />

      {/* Xem chi tiết */}
      <ViewDetailModal
        open={viewTarget !== null}
        enterprise={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      {/* Đổi mật khẩu */}
      <InitPasswordModal
        open={pwdTarget !== null}
        username={pwdTarget?.user?.username || pwdTarget?.taxCode || ""}
        onClose={() => setPwdTarget(null)}
        onSave={async (newPassword) => {
          if (!pwdTarget) return;
          await businessService.changePassword({
            username: pwdTarget.user?.username || pwdTarget.taxCode,
            newPassword: newPassword,
          });
        }}
      />

      {/* Review Import */}
      <EnterpriseImportPreviewModal
        open={!!previewData}
        previewData={previewData}
        onClose={() => setPreviewData(null)}
        onConfirm={handleConfirmImport}
        isLoading={isImporting}
      />
    </div>
  );
}
