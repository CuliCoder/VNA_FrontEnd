"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import BusinessTable from "./BusinessTable";
import EditBusinessModal from "./EditBusinessModal";
import { ViewDetailModal } from "./BusinessesModal";
import {
  businessService,
  Enterprise,
} from "@/services/businessService";
import { 
  Button,
  DeleteConfirmModal,
  InitPasswordModal
} from "@/components/common";

export default function BusinessesView() {
  // ── Data state ─────────────────────────────────────────────────────────
  const [data, setData] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Modal state ────────────────────────────────────────────────────────
  const [viewTarget, setViewTarget] = useState<Enterprise | null>(null);
  const [editTarget, setEditTarget] = useState<Enterprise | null>(null);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const res = await businessService.importEnterprises(file);
      fetchData();
      toast.success(res.data?.message || "Nhập file thành công");
    } catch (error: any) {
      toast.error(error.message || "Nhập file thất bại");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          onEdit={(item) => setEditTarget(item)}
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

      {/* Chỉnh sửa */}
      <EditBusinessModal
        open={editTarget !== null}
        enterprise={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          setEditTarget(null);
          fetchData();
        }}
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
    </div>
  );
}
