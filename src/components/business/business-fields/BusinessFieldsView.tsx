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
    <div className="flex flex-col flex-1 h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách ngành nghề kinh doanh
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
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
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
