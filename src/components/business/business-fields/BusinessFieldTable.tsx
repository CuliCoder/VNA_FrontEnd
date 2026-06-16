"use client";

import React, { useState, useMemo } from "react";
import { Edit3, ChevronDown } from "lucide-react";
import { BusinessField } from "@/services/businessFieldService";
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

const LEVEL_LABELS: Record<number, string> = {
  1: "Cấp 1",
  2: "Cấp 2",
  3: "Cấp 3",
  4: "Cấp 4",
  5: "Cấp 5",
};

interface BusinessFieldTableProps {
  data: BusinessField[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onStatusChange: (id: number, status: boolean) => void;
  onEdit: (item: BusinessField) => void;
  onDeleteSelected?: (ids: number[]) => void;
}

export default function BusinessFieldTable({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onStatusChange,
  onEdit,
  onDeleteSelected,
}: BusinessFieldTableProps) {
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const {
    selectedIds,
    selectedIdsSet,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
  } = useTableSelection<BusinessField>(data, (e) => e.id);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchCode = item.code.toLowerCase().includes(filterCode.toLowerCase());
      const matchName = item.name.toLowerCase().includes(filterName.toLowerCase());
      let matchLevel = true;
      if (filterLevel !== "all") {
        matchLevel = item.level === Number(filterLevel);
      }
      let matchStatus = true;
      if (filterStatus === "active") matchStatus = item.status === true;
      if (filterStatus === "inactive") matchStatus = item.status === false;
      return matchCode && matchName && matchLevel && matchStatus;
    });
  }, [data, filterCode, filterName, filterLevel, filterStatus]);

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

  const getLevelIndent = (level: number) => {
    if (level <= 1) return "";
    return "— ".repeat(level - 1);
  };

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
                <div className="mb-2">Mã ngành</div>
                <input
                  type="text"
                  placeholder="Lọc mã..."
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 font-normal text-xs"
                  value={filterCode}
                  onChange={(e) => { setFilterCode(e.target.value); onPageChange(1); }}
                />
              </TableHead>
              <TableHead className="min-w-[360px]">
                <div className="mb-2">Tên ngành nghề</div>
                <input
                  type="text"
                  placeholder="Lọc tên..."
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 font-normal text-xs"
                  value={filterName}
                  onChange={(e) => { setFilterName(e.target.value); onPageChange(1); }}
                />
              </TableHead>
              <TableHead className="min-w-[100px]">
                <div className="mb-2">Cấp</div>
                <div className="relative">
                  <select
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-normal bg-white text-xs"
                    value={filterLevel}
                    onChange={(e) => { setFilterLevel(e.target.value); onPageChange(1); }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="1">Cấp 1</option>
                    <option value="2">Cấp 2</option>
                    <option value="3">Cấp 3</option>
                    <option value="4">Cấp 4</option>
                    <option value="5">Cấp 5</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
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
                <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
                <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
                      <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded" onClick={() => onEdit(item)}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </TableCell>
                    <TableCell className="align-middle font-medium">{item.code}</TableCell>
                    <TableCell className="align-middle">
                      <span className="text-gray-400">{getLevelIndent(item.level)}</span>
                      {item.name}
                    </TableCell>
                    <TableCell className="align-middle">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {LEVEL_LABELS[item.level] ?? `Cấp ${item.level}`}
                      </span>
                    </TableCell>
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
