"use client";

import React, { useState } from "react";
import { Edit3, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { BusinessType } from "@/services/businessTypeService";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Check } from "lucide-react";

interface BusinessTypeTableProps {
  data: BusinessType[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onStatusChange: (id: number, status: boolean) => void;
  onDeleteSelected?: (ids: number[]) => void;
}

export default function BusinessTypeTable({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onStatusChange,
  onDeleteSelected,
}: BusinessTypeTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredData = data.filter((item) => {
    const matchCode = filterCode.trim() === "" || item.code.toLowerCase().includes(filterCode.toLowerCase());
    const matchName = filterName.trim() === "" || item.name.toLowerCase().includes(filterName.toLowerCase());
    const matchStatus = filterStatus === "all" || (filterStatus === "active" && item.status) || (filterStatus === "inactive" && !item.status);
    return matchCode && matchName && matchStatus;
  });

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  // Selection Logic
  const allSelected = paginatedData.length > 0 && paginatedData.every((r) => selectedIds.has(r.id));
  const someSelected = paginatedData.some((r) => selectedIds.has(r.id)) && !allSelected;

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));

  // Render Checkbox
  const renderCheckbox = (checked: boolean, indeterminate: boolean, onCheckedChange: (c: boolean) => void) => (
    <CheckboxPrimitive.Root
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className="flex h-4 w-4 appearance-none items-center justify-center rounded border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600"
    >
      <CheckboxPrimitive.Indicator>
        {indeterminate ? (
          <span className="block w-2 h-0.5 bg-white rounded" />
        ) : (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  // Render Switch
  const renderSwitch = (checked: boolean, onCheckedChange: (c: boolean) => void) => (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );

  return (
    <div className="flex flex-col h-full flex-1 relative">
      <div className="overflow-auto border border-gray-200 rounded-md flex-1">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 w-10 text-center">
                {renderCheckbox(allSelected, someSelected, toggleAll)}
              </th>
              <th scope="col" className="px-4 py-3 w-10 text-center"></th>
              <th scope="col" className="px-4 py-3 min-w-[150px]">
                <div className="mb-2">Mã loại hình</div>
                <input
                  type="text"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                  value={filterCode}
                  onChange={(e) => { setFilterCode(e.target.value); onPageChange(1); }}
                />
              </th>
              <th scope="col" className="px-4 py-3 min-w-[300px]">
                <div className="mb-2">Tên loại hình</div>
                <input
                  type="text"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                  value={filterName}
                  onChange={(e) => { setFilterName(e.target.value); onPageChange(1); }}
                />
              </th>
              <th scope="col" className="px-4 py-3 min-w-[150px]">
                <div className="mb-2">Trạng thái</div>
                <div className="relative">
                  <select
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-normal bg-white"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); onPageChange(1); }}
                  >
                    <option value="all"></option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td></tr>
            ) : (
              paginatedData.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <tr key={item.id} className={`transition-colors hover:bg-gray-50 ${isSelected ? "bg-blue-50/60" : ""}`}>
                    <td className="px-4 py-3 text-center align-middle">
                      {renderCheckbox(isSelected, false, (v) => toggleOne(item.id, v))}
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 align-middle">{item.code}</td>
                    <td className="px-4 py-3 align-middle">{item.name}</td>
                    <td className="px-4 py-3 align-middle">
                      {renderSwitch(item.status, (checked) => onStatusChange(item.id, checked))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SELECTION BAR */}
      {selectedCount > 0 && onDeleteSelected && (
        <div className="flex items-center gap-3 mt-3 px-2 animate-in slide-in-from-bottom-2 duration-200">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            {selectedCount} dữ liệu được chọn
          </span>
          <button
            onClick={() => {
              onDeleteSelected(Array.from(selectedIds));
              setSelectedIds(new Set());
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Xóa
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-gray-600 p-1 rounded transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-end px-4 py-3 border-t border-gray-200 gap-4 mt-auto">
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => { onLimitChange(Number(e.target.value)); onPageChange(1); }}
            className="border border-gray-300 rounded text-sm p-1 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-500 -ml-5 pointer-events-none" />
        </div>

        <span className="text-sm text-gray-600">
          {filteredData.length > 0
            ? `${(page - 1) * limit + 1} - ${Math.min(page * limit, filteredData.length)} of ${filteredData.length}`
            : "0 of 0"}
        </span>

        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
