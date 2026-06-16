"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Download, Upload } from "lucide-react";
import BusinessTypeTable from "./BusinessTypeTable";
import AddBusinessTypeModal from "./AddBusinessTypeModal";
import { businessTypeService, BusinessType } from "@/services/businessTypeService";
import { DeleteConfirmModal } from "../businessses/BusinessesModal";
import { toast } from "sonner";

export default function BusinessTypesView() {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Delete states
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await businessTypeService.deleteBusinessTypes(deleteIds);
      setDeleteIds([]);
      fetchBusinessTypes();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchBusinessTypes = async () => {
    setIsLoading(true);

    try {
      const data = await businessTypeService.getBusinessTypes();

      // API hiện trả về BusinessType[]
      setBusinessTypes(data);
      setTotal(data.length);
    } catch (error) {
      console.error("Error fetching business types:", error);
    } finally {
      setIsLoading(false);
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
      const res = await businessTypeService.importBusinessTypes(file);
      fetchBusinessTypes();
      toast.success(res.message);
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    fetchBusinessTypes();
  }, [page, limit]);

  const handleStatusChange = async (id: number, status: boolean) => {
    try {
      await businessTypeService.updateBusinessTypeStatus(id, status);

      // Optimistic update
      setBusinessTypes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    } catch (error: any) {
      toast.error("Cập nhật thất bại", error.message);
      // Revert if API fails
      fetchBusinessTypes();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách loại hình kinh doanh
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

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <BusinessTypeTable
          data={businessTypes}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onStatusChange={handleStatusChange}
          onDeleteSelected={(ids) => setDeleteIds(ids)}
        />
      </div>

      <AddBusinessTypeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchBusinessTypes();
        }}
      />

      {/* Xóa */}
      <DeleteConfirmModal
        open={deleteIds.length > 0}
        ids={deleteIds}
        onClose={() => setDeleteIds([])}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}