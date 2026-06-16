"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Trash2,
  Key,
} from "lucide-react";
import { adminUserService } from "@/services/adminUserService";
import InitPasswordModal from "./InitPasswordModal";
import type { User, Role } from "@/types/auth";
import type { UserListParams } from "@/types/adminUser";
import { toast } from "sonner";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Button,
  Pagination,
  FloatingSelectionBar 
} from "@/components/common";
import { useTableSelection } from "@/hooks/useTableSelection";
import { usePagination } from "@/hooks/usePagination";

const GENDER_MAP: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

interface Column {
  key: string;
  label: string;
  width?: string;
}

const COLUMNS: Column[] = [
  { key: "fullName", label: "Họ và tên", width: "w-52" },
  { key: "username", label: "Tài khoản", width: "w-36" },
  { key: "email", label: "Email", width: "w-56" },
  { key: "role", label: "Vai trò", width: "w-32" },
  { key: "position", label: "Chức danh", width: "w-32" },
  { key: "isActive", label: "Trạng thái", width: "w-28" },
];

export default function UserListTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [initPasswordUser, setInitPasswordUser] = useState<User | null>(null);

  // Filters
  const [filterFullName, setFilterFullName] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Hooks
  const { page, limit, total, totalPages, setPage, setLimit, setTotal } = usePagination(1, 10);
  const { 
    selectedIds, 
    selectedIdsSet, 
    toggleSelection, 
    selectAll, 
    clearSelection, 
    isAllSelected, 
    isPartiallySelected 
  } = useTableSelection<User>(users, (u) => u.id);

  // Debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [debouncedFilters, setDebouncedFilters] = useState({
    fullName: "",
    username: "",
    email: "",
    position: "",
  });

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedFilters({
        fullName: filterFullName,
        username: filterUsername,
        email: filterEmail,
        position: filterPosition,
      });
      setPage(1);
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [filterFullName, filterUsername, filterEmail, filterPosition, setPage]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      clearSelection();
      const params: UserListParams = {
        page,
        limit,
        fullName: debouncedFilters.fullName || undefined,
        username: debouncedFilters.username || undefined,
        email: debouncedFilters.email || undefined,
        position: debouncedFilters.position || undefined,
        roleId: filterRole ? Number(filterRole) : undefined,
        isActive:
          filterStatus === ""
            ? undefined
            : filterStatus === "true"
              ? true
              : false,
      };
      const result = await adminUserService.getUsers(params);
      setUsers(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedFilters, filterRole, filterStatus, clearSelection, setTotal]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    adminUserService
      .getRoles()
      .then(setRoles)
      .catch(() => { });
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      await adminUserService.toggleStatus(user.id, !user.isActive);
      toast.success(
        !user.isActive ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hóa tài khoản",
      );
      fetchUsers();
    } catch (ex: any) {
      toast.error(ex.message || "Không thể thay đổi trạng thái");
    }
  };

  const handleInitPassword = async (userId: number, newPassword: string) => {
    try {
      const res = await adminUserService.initPassword(userId, newPassword);
      toast.success(res);
    } catch (ex: any) {
      toast.error(ex.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} người dùng đã chọn?`)) {
      return;
    }
    try {
      await adminUserService.bulkDeleteUsers(selectedIds as number[]);
      toast.success("Đã xóa các người dùng được chọn thành công");
      clearSelection();
      fetchUsers();
    } catch (ex: any) {
      toast.error(ex.message || "Không thể xóa người dùng");
    }
  };

  const handleExportData = async () => {
    try {
      toast.info("Đang xuất dữ liệu...");
      const params: UserListParams = {
        fullName: debouncedFilters.fullName || undefined,
        username: debouncedFilters.username || undefined,
        email: debouncedFilters.email || undefined,
        position: debouncedFilters.position || undefined,
        roleId: filterRole ? Number(filterRole) : undefined,
        isActive:
          filterStatus === ""
            ? undefined
            : filterStatus === "true"
              ? true
              : false,
      };
      const blob = await adminUserService.exportUsers(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Xuất dữ liệu thành công");
    } catch (error) {
      toast.error("Lỗi khi xuất dữ liệu");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.info("Đang nhập dữ liệu...");
      await adminUserService.importUsers(file);
      toast.success("Nhập dữ liệu thành công");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi nhập dữ liệu");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 🟢 Header 🟢 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách người dùng
        </h1>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import
          </Button>

          <Button 
            variant="primary" 
            size="sm"
            onClick={() => router.push("/dashboard/users/new")}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* 🟢 Table Card 🟢 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500"
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
              <TableHead className="w-32 text-center">Hành động</TableHead>
              {COLUMNS.map((col) => (
                <TableHead key={col.key} className={col.width}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="bg-gray-50/50">
              <TableCell></TableCell>
              <TableCell></TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={`filter-${col.key}`} className="p-2">
                  {col.key === "role" ? (
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="">Tất cả</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  ) : col.key === "isActive" ? (
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Đang kích hoạt</option>
                      <option value="false">Vô hiệu hóa</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Lọc ${col.label.toLowerCase()}...`}
                      value={
                        col.key === "fullName"
                          ? filterFullName
                          : col.key === "username"
                            ? filterUsername
                            : col.key === "email"
                              ? filterEmail
                              : filterPosition
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (col.key === "fullName") setFilterFullName(val);
                        else if (col.key === "username") setFilterUsername(val);
                        else if (col.key === "email") setFilterEmail(val);
                        else if (col.key === "position") setFilterPosition(val);
                      }}
                      className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length + 2}
                  className="py-16 text-center text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Đang tải...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length + 2}
                  className="py-16 text-center text-gray-400 text-sm"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="group"
                >
                  {/* Checkbox */}
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIdsSet.has(user.id)}
                      onChange={() => toggleSelection(user.id)}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setInitPasswordUser(user)}
                        className="p-1 rounded hover:bg-yellow-100 text-yellow-600 transition"
                        title="Khởi tạo mật khẩu"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/dashboard/users/${user.id}`)
                        }
                        className="p-1 rounded hover:bg-blue-100 text-blue-600 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/dashboard/users/${user.id}?view=true`)
                        }
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-gray-800">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {user.username}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {user.role?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {user.position ?? "—"}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`w-10 h-5 rounded-full relative transition-all duration-200 focus:outline-none ${user.isActive ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      title={user.isActive ? "Đang kích hoạt" : "Vô hiệu hóa"}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white shadow absolute top-0.5 transition-transform duration-200 ${user.isActive ? "translate-x-5" : "translate-x-0.5"
                          }`}
                      />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 🟢 Footer / Pagination 🟢 */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/30 shrink-0 pr-4">
           <button
             onClick={handleExportData}
             className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition px-4 py-3"
           >
             <Download className="w-3.5 h-3.5" />
             Export Data
           </button>
           <Pagination 
             page={page} 
             limit={limit} 
             total={total} 
             totalPages={totalPages} 
             onPageChange={setPage} 
             onLimitChange={setLimit} 
             className="border-none bg-transparent py-2.5 px-0"
           />
        </div>

        <FloatingSelectionBar
          selectedCount={selectedIds.length}
          onClearSelection={clearSelection}
          onDelete={handleBulkDelete}
        />
      </div>

      <InitPasswordModal
        isOpen={!!initPasswordUser}
        onClose={() => setInitPasswordUser(null)}
        user={initPasswordUser}
        onSubmit={handleInitPassword}
      />
    </div>
  );
}
