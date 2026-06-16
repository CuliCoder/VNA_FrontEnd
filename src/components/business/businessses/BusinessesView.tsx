"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import BusinessTable from "./BusinessTable";
import EditBusinessModal from "./EditBusinessModal";
import {
  DeleteConfirmModal,
  ViewDetailModal,
  ChangePasswordModal,
} from "./BusinessesModal";
import {
  businessService,
  Enterprise,
} from "@/services/businessService";

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
      await businessService.updateStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchData();
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

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách doanh nghiệp
        </h1>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
          />
          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? "Đang xử lý..." : "Thêm từ file"}
          </button>

          <Link
            href="/dashboard/business/create"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </Link>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 px-6 py-4 overflow-hidden flex flex-col min-h-0">
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

      {/* ── Modals ── */}

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
      <ChangePasswordModal
        open={pwdTarget !== null}
        enterprise={pwdTarget}
        onClose={() => setPwdTarget(null)}
        onSuccess={() => setPwdTarget(null)}
      />
    </div>
  );
}
