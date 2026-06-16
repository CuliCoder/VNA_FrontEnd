"use client";

import React, { useState, useMemo } from "react";
import { Edit3, ChevronDown } from "lucide-react";
import { BusinessType } from "@/services/businessTypeService";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  FloatingSelectionBar,
} from "@/components/common";
import { useTableSelection } from "@/hooks/useTableSelection";

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
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const {
    selectedIds,
    selectedIdsSet,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
  } = useTableSelection<BusinessType>(data, (e) => e.id);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchCode = item.code.toLowerCase().includes(filterCode.toLowerCase());
      const matchName = item.name.toLowerCase().includes(filterName.toLowerCase());
      let matchStatus = true;
      if (filterStatus === "active") matchStatus = item.status === true;
      if (filterStatus === "inactive") matchStatus = item.status === false;
      return matchCode && matchName && matchStatus;
    });
  }, [data, filterCode, filterName, filterStatus]);

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

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={() => {
                    if (isAllSelected) clearSelection();
                    else selectAll();
                  }}
                />
              </TableHead>
              <TableHead className="w-16 text-center">Hành động</TableHead>
              <TableHead className="min-w-[150px]">
                <div className="mb-2">Mã loại hình</div>
                <input
                  type="text"
                  placeholder="Lọc mã..."
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 font-normal text-xs"
                  value={filterCode}
                  onChange={(e) => { setFilterCode(e.target.value); onPageChange(1); }}
                />
              </TableHead>
              <TableHead className="min-w-[300px]">
                <div className="mb-2">Tên loại hình</div>
                <input
                  type="text"
                  placeholder="Lọc tên..."
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 font-normal text-xs"
                  value={filterName}
                  onChange={(e) => { setFilterName(e.target.value); onPageChange(1); }}
                />
              </TableHead>
              <TableHead className="min-w-[150px]">
                <div className="mb-2">Trạng thái</div>
                <div className="relative">
                  <select
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-normal bg-white text-xs"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); onPageChange(1); }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const isSelected = selectedIdsSet.has(item.id);
                return (
                  <TableRow key={item.id} className={isSelected ? "bg-blue-50/60" : ""}>
                    <TableCell className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </TableCell>
                    <TableCell className="align-middle">{item.code}</TableCell>
                    <TableCell className="align-middle">{item.name}</TableCell>
                    <TableCell className="align-middle">
                      {renderSwitch(item.status, (checked) => onStatusChange(item.id, checked))}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <FloatingSelectionBar
        selectedCount={selectedIds.length}
        onClearSelection={clearSelection}
        onDelete={onDeleteSelected ? () => {
          onDeleteSelected(selectedIds as number[]);
          clearSelection();
        } : undefined}
      />

      {/* 🟢 Footer / Pagination 🟢 */}
      <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/30 shrink-0 pr-4">
        <Pagination
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          className="border-none bg-transparent py-2.5 px-0"
        />
      </div>
    </>
  );
}
