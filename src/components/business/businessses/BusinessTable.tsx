"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Eye, Pencil, KeyRound, ChevronDown } from "lucide-react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import {
  type EnterpriseStatus,
  Enterprise,
} from "@/services/businessService";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
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

function StatusSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onChange}
      className="inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}

// 🟢 Props 🟢

interface BusinessTableProps {
  data: Enterprise[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onStatusChange: (
    id: number,
    status: EnterpriseStatus
  ) => void | Promise<void>;
  onView: (item: Enterprise) => void;
  onEdit: (item: Enterprise) => void;
  onChangePassword: (item: Enterprise) => void;
  onDeleteSelected: (ids: number[]) => void;
  resetSelection?: number;
}

// 🟢 Component 🟢

export default function BusinessTable({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onStatusChange,
  onView,
  onEdit,
  onChangePassword,
  onDeleteSelected,
  resetSelection,
}: BusinessTableProps) {
  const {
    selectedIds,
    selectedIdsSet,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
  } = useTableSelection<Enterprise>(data, (e) => e.id);

  useEffect(() => {
    if (resetSelection) {
      clearSelection();
    }
  }, [resetSelection, clearSelection]);

  // Data for filters
  const [businessTypes, setBusinessTypes] = useState<{ id: number; name: string; code: string }[]>([]);
  const [businessFields, setBusinessFields] = useState<{ id: number; name: string; code: string }[]>([]);

  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterTaxCode, setFilterTaxCode] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchName = item.name.toLowerCase().includes(filterName.toLowerCase());
      const matchTax = item.taxCode.toLowerCase().includes(filterTaxCode.toLowerCase());
      const matchAddress = (item.registeredAddress || "").toLowerCase().includes(filterAddress.toLowerCase());

      let matchType = true;
      if (filterType) matchType = item.businessType?.code === filterType;

      let matchField = true;
      if (filterField) matchField = item.businessField?.code === filterField;

      let matchStatus = true;
      if (filterStatus) matchStatus = item.status.toLowerCase() === filterStatus.toLowerCase();

      return matchName && matchTax && matchType && matchField && matchAddress && matchStatus;
    });
  }, [data, filterName, filterTaxCode, filterType, filterField, filterAddress, filterStatus]);

  useEffect(() => {
    import("@/services/businessTypeService").then(({ businessTypeService }) => {
      businessTypeService.getBusinessTypes().then(setBusinessTypes).catch(console.error);
    });
    import("@/services/businessFieldService").then(({ businessFieldService }) => {
      businessFieldService.getBusinessFields().then(setBusinessFields).catch(console.error);
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      {/* Table */}
      <div className="flex-1 overflow-auto">
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
              <TableHead className="w-[120px] text-center">Hành động</TableHead>
              <TableHead className="min-w-[200px]">Tên doanh nghiệp</TableHead>
              <TableHead className="min-w-[140px]">Mã số thuế</TableHead>
              <TableHead className="min-w-[150px]">Loại hình DN</TableHead>
              <TableHead className="min-w-[180px]">Lĩnh vực KD</TableHead>
              <TableHead className="min-w-[200px]">Địa chỉ ĐKKD</TableHead>
              <TableHead className="min-w-[140px] text-center">Trạng thái</TableHead>
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableCell className="p-2"></TableCell>
              <TableCell className="p-2"></TableCell>
              <TableCell className="p-2">
                <input
                  placeholder="Lọc tên..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                />
              </TableCell>
              <TableCell className="p-2">
                <input
                  placeholder="Lọc MST..."
                  value={filterTaxCode}
                  onChange={(e) => setFilterTaxCode(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                />
              </TableCell>
              <TableCell className="p-2">
                <SearchableSelect
                  value={filterType}
                  placeholder="Tất cả"
                  options={[
                    { value: "", label: "Tất cả" },
                    ...businessTypes.map((t) => ({ value: t.code, label: t.name })),
                  ]}
                  onChange={(val) => setFilterType(String(val))}
                />
              </TableCell>
              <TableCell className="p-2">
                <SearchableSelect
                  value={filterField}
                  placeholder="Tất cả"
                  options={[
                    { value: "", label: "Tất cả" },
                    ...businessFields.map((f) => ({ value: f.code, label: f.name })),
                  ]}
                  onChange={(val) => setFilterField(String(val))}
                />
              </TableCell>
              <TableCell className="p-2">
                <input
                  placeholder="Lọc địa chỉ..."
                  value={filterAddress}
                  onChange={(e) => setFilterAddress(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                />
              </TableCell>
              <TableCell className="p-2">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 pr-6 outline-none focus:border-blue-400 appearance-none bg-white text-gray-600"
                  >
                    <option value="">Tất cả</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Ngừng HĐ</option>
                    <option value="pending">Chờ duyệt</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-10 text-center text-gray-400">
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
                <TableCell colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const isSelected = selectedIdsSet.has(item.id);
                return (
                  <TableRow
                    key={item.id}
                    className={isSelected ? "bg-blue-50/60" : ""}
                  >
                    <TableCell className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onView(item)}
                          title="Xem chi tiết"
                          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onChangePassword(item)}
                          title="Đổi mật khẩu"
                          className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-gray-800 max-w-[220px] truncate">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {item.taxCode}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {item.businessType?.name}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-[220px] truncate">
                      {item.businessField?.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {item.registeredAddress}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <StatusSwitch
                        checked={item.status === "APPROVED"}
                        onChange={(v) =>
                          onStatusChange(
                            item.id,
                            v ? "APPROVED" : "REJECTED"
                          )
                        }
                      />
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
        onDelete={() => onDeleteSelected(selectedIds as number[])}
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
