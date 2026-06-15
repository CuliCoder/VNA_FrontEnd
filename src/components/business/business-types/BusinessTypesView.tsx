"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Upload } from "lucide-react";
import BusinessTypeTable from "./BusinessTypeTable";
import AddBusinessTypeModal from "./AddBusinessTypeModal";
import { businessTypeService, BusinessType } from "@/services/businessTypeService";
import { DeleteConfirmModal } from "../businessses/BusinessesModal";

export default function BusinessTypesView() {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    } catch (err) {
      console.error("Xóa thất bại:", err);
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
    } catch (error) {
      console.error("Failed to update status", error);

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
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
            <Upload className="w-4 h-4" />
            Thêm từ file
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