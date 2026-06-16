"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Download, Upload } from "lucide-react";
import BusinessTypeTable from "./BusinessTypeTable";
import AddBusinessTypeModal from "./AddBusinessTypeModal";
import { businessTypeService, BusinessType } from "@/services/businessTypeService";
import { DeleteConfirmModal } from "../businessses/BusinessesModal";
import { toast } from "sonner";
import { Button } from "@/components/common";

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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách loại hình kinh doanh
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
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative p-4">
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