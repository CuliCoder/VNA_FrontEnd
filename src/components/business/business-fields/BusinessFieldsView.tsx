"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import BusinessFieldTable from "./BusinessFieldTable";
import BusinessFieldModal from "./BusinessFieldModal";
import { DeleteConfirmModal } from "../businessses/BusinessesModal";
import { toast } from "sonner";
import {
  businessFieldService,
  BusinessField,
} from "@/services/businessFieldService";
import { Button } from "@/components/common";

export default function BusinessFieldsView() {
  const [businessFields, setBusinessFields] = useState<BusinessField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessField | null>(null);
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
      await businessFieldService.deleteBusinessFields(deleteIds);
      setDeleteIds([]);
      fetchBusinessFields();
      toast.success("Xóa thành công");
    } catch (err: any) {
      toast.error(err.message || "Xóa thất bại");
      console.error("Xóa thất bại:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchBusinessFields = async () => {
    setIsLoading(true);
    try {
      const data = await businessFieldService.getBusinessFields();
      setBusinessFields(data);
      setTotal(data.length);
    } catch (error) {
      console.error("Error fetching business fields:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessFields();
  }, [page, limit]);

  const handleStatusChange = async (id: number, status: boolean) => {
    try {
      await businessFieldService.updateBusinessFieldStatus(id, status);
      // Optimistic update
      setBusinessFields((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      toast.success("Cập nhật trạng thái thành công");
    } catch (error: any) {
      toast.error(error.message || "Cập nhật trạng thái thất bại");
      console.error("Failed to update status", error);
      // Revert if API fails
      fetchBusinessFields();
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
      const res = await businessFieldService.importBusinessFields(file);
      fetchBusinessFields();
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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BusinessField) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    fetchBusinessFields();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách ngành nghề kinh doanh
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
            onClick={handleOpenAdd}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative p-4">
        <BusinessFieldTable
          data={businessFields}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onStatusChange={handleStatusChange}
          onEdit={handleOpenEdit}
          onDeleteSelected={(ids) => setDeleteIds(ids)}
        />
      </div>

      {/* Add / Edit Modal */}
      <BusinessFieldModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editItem={editingItem}
        allFields={businessFields}
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
