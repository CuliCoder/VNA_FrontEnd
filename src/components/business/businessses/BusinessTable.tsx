"use client";

import React, { useState } from "react";
import { Eye, Pencil, KeyRound, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import {
  type EnterpriseStatus,
  Enterprise,
} from "@/services/businessService";
// ─── Helper Components ──────────────────────────────────────────────────────

function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onChange?.(v === true)}
      className="flex h-4 w-4 appearance-none items-center justify-center rounded border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600"
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
}

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

// ─── Props ──────────────────────────────────────────────────────────────────

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
}

// ─── Component ──────────────────────────────────────────────────────────────

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
}: BusinessTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Data for filters
  const [businessTypes, setBusinessTypes] = useState<{ id: number; name: string; code: string }[]>([]);
  const [businessFields, setBusinessFields] = useState<{ id: number; name: string; code: string }[]>([]);

  // Fetch filter options
  React.useEffect(() => {
    import("@/services/businessTypeService").then(({ businessTypeService }) => {
      businessTypeService.getBusinessTypes().then(setBusinessTypes).catch(console.error);
    });
    import("@/services/businessFieldService").then(({ businessFieldService }) => {
      businessFieldService.getBusinessFields().then(setBusinessFields).catch(console.error);
    });
  }, []);

  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterTax, setFilterTax] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterWard, setFilterWard] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ── Selection ──────────────────────────────────────────────────────────
  const filteredData = data.filter((item) => {
    const n = filterName.trim().toLowerCase();
    const t = filterTax.trim().toLowerCase();
    return (
      (!n || item.name?.toLowerCase().includes(n)) &&
      (!t || item.taxCode?.toLowerCase().includes(t)) &&
      (!filterType || item.businessType?.code === filterType) &&
      (!filterField || item.businessField?.code === filterField) &&
      (!filterWard || item.registeredAddress?.toLowerCase().includes(filterWard.toLowerCase())) &&
      (filterStatus === "" ||
        (filterStatus === "active" && item.user?.isActive) ||
        (filterStatus === "inactive" && !item.user?.isActive))
    );
  });

  const allSelected =
    filteredData.length > 0 && filteredData.every((r) => selectedIds.has(r.id));
  const someSelected =
    filteredData.some((r) => selectedIds.has(r.id)) && !allSelected;

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.map((r) => r.id)));
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

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 h-full relative">
      {/* Table */}
      <div className="overflow-auto border border-gray-200 rounded-md flex-1">
        <table className="w-full text-sm text-left text-gray-700">
          {/* ── HEADER ── */}
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {/* Checkbox all */}
              <th className="px-3 py-3 w-10 text-center">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </th>

              {/* Thao tác */}
              <th className="px-3 py-3 w-28 text-center whitespace-nowrap">
                Thao tác
              </th>

              {/* Tên doanh nghiệp */}
              <th className="px-3 py-3 min-w-[200px]">
                <div className="mb-1.5 font-semibold">Tên doanh nghiệp</div>
                <input
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-normal outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Lọc..."
                />
              </th>

              {/* Mã số thuế */}
              <th className="px-3 py-3 min-w-[130px]">
                <div className="mb-1.5 font-semibold">Mã số thuế</div>
                <input
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-normal outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterTax}
                  onChange={(e) => setFilterTax(e.target.value)}
                  placeholder="Lọc..."
                />
              </th>

              {/* Loại hình kinh doanh */}
              <th className="px-3 py-3 min-w-[160px]">
                <div className="mb-1.5 font-semibold">Loại hình kinh doanh</div>
                <div className="relative">
                  <select
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-normal bg-white outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value=""></option>
                    {businessTypes.map(t => (
                      <option key={t.id} value={t.code}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              </th>

              {/* Ngành nghề */}
              <th className="px-3 py-3 min-w-[200px]">
                <div className="mb-1.5 font-semibold">Ngành nghề kinh doanh</div>
                <div className="relative">
                  <select
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-normal bg-white outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                  >
                    <option value=""></option>
                    {businessFields.map(f => (
                      <option key={f.id} value={f.code}>{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              </th>

              {/* Phường/Xã */}
              <th className="px-3 py-3 min-w-[140px]">
                <div className="mb-1.5 font-semibold">Phường / Xã</div>
                <input
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-normal outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value)}
                  placeholder="Lọc..."
                />
              </th>

              {/* Trạng thái */}
              <th className="px-3 py-3 min-w-[120px]">
                <div className="mb-1.5 font-semibold">Trạng thái</div>
                <div className="relative">
                  <select
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-normal bg-white outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng HĐ</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              </th>
            </tr>
          </thead>

          {/* ── BODY ── */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-gray-50 ${isSelected ? "bg-blue-50/60" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3 text-center align-middle">
                      <Checkbox
                        checked={isSelected}
                        onChange={(v) => toggleOne(item.id, v)}
                      />
                    </td>

                    {/* Action icons */}
                    <td className="px-3 py-3 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        {/* Mắt - xem chi tiết */}
                        <button
                          onClick={() => onView(item)}
                          title="Xem chi tiết"
                          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Bút - chỉnh sửa */}
                        <button
                          onClick={() => onEdit(item)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Chìa khóa - đổi mật khẩu */}
                        <button
                          onClick={() => onChangePassword(item)}
                          title="Đổi mật khẩu"
                          className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Data columns */}
                    <td className="px-3 py-3 align-middle font-medium text-gray-800 max-w-[220px] truncate">
                      {item.name}
                    </td>
                    <td className="px-3 py-3 align-middle text-gray-600">
                      {item.taxCode}
                    </td>
                    <td className="px-3 py-3 align-middle text-gray-600">
                      {item.businessType?.name}
                    </td>
                    <td className="px-3 py-3 align-middle text-gray-600 max-w-[220px] truncate">
                      {item.businessField?.name}
                    </td>
                    <td className="px-3 py-3 align-middle text-gray-600">
                      {item.registeredAddress}
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <StatusSwitch
                        checked={item.status === "APPROVED"}
                        onChange={(v) =>
                          onStatusChange(
                            item.id,
                            v ? "APPROVED" : "REJECTED"
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── SELECTION BAR ── */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 mt-3 px-2 animate-in slide-in-from-bottom-2 duration-200">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            {selectedCount} dữ liệu được chọn
          </span>
          <button
            onClick={() => onDeleteSelected(Array.from(selectedIds))}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── PAGINATION ── */}
      <div className="flex items-center justify-end px-2 py-3 border-t border-gray-100 gap-4 mt-2">
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border border-gray-300 rounded text-sm px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <span className="text-sm text-gray-600">
          {total === 0
            ? "0 - 0 of 0"
            : `${(page - 1) * limit + 1} - ${Math.min(page * limit, total)} of ${total}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
