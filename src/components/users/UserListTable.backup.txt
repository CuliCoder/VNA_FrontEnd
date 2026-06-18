"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Filter,
  Trash2,
  Key,
  X,
} from "lucide-react";
import { adminUserService } from "@/services/adminUserService";
import InitPasswordModal from "./InitPasswordModal";
import type { User, Role } from "@/types/auth";
import type { UserListParams } from "@/types/adminUser";
import { toast } from "sonner";

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
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [initPasswordUser, setInitPasswordUser] = useState<User | null>(null);

  // Filters
  const [filterFullName, setFilterFullName] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPosition, setFilterPosition] = useState("");

  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
  }, [filterFullName, filterUsername, filterEmail, filterPosition]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      setSelectedUserIds([]);
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
      setTotalPages(result.totalPages ?? 1);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedFilters, filterRole, filterStatus]);

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
    try {
      await adminUserService.bulkDeleteUsers(selectedUserIds);
      toast.success("Đã xóa các người dùng được chọn thành công");
      setSelectedUserIds([]);
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

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Danh sách người dùng
        </h1>
        <div className="flex items-center gap-2">
          {selectedUserIds.length > 0 && (
            <div className="flex items-center bg-white rounded shadow border border-gray-100 h-[34px] overflow-hidden mr-2">
              <div className="bg-[#2D68FE] text-white font-semibold text-sm px-3 h-full flex items-center justify-center">
                {selectedUserIds.length}
              </div>
              <div className="px-3 text-sm text-gray-800 font-medium bg-white h-full flex items-center">
                dữ liệu được chọn
              </div>
              <div className="h-full py-[3px] bg-white">
                <button
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUserIds.length} người dùng đã chọn?`)) {
                      handleBulkDelete();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 h-full text-xs font-medium text-white bg-[#FF0000] hover:bg-red-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xoá
                </button>
              </div>
              <div className="h-full bg-white px-1 flex items-center">
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Data
          </button>
          <button
            onClick={() => router.push("/dashboard/users/new")}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="w-10 px-3 py-2.5"></th>
                <th className="w-16 px-2 py-2.5"></th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.width} px-3 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
              {/* Filter inputs per column */}
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <td className="px-3 py-1.5">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={users.length > 0 && selectedUserIds.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds(users.map((u) => u.id));
                      } else {
                        setSelectedUserIds([]);
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-1.5" />
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-3 py-1.5">
                    {col.key === "role" ? (
                      <select
                        value={filterRole}
                        onChange={(e) => {
                          setFilterRole(e.target.value);
                          setPage(1);
                        }}
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
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setPage(1);
                        }}
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="">Tất cả</option>
                        <option value="true">Kích hoạt</option>
                        <option value="false">Vô hiệu</option>
                      </select>
                    ) : (
                      <input
                        value={
                          col.key === "fullName"
                            ? filterFullName
                            : col.key === "username"
                              ? filterUsername
                              : col.key === "email"
                                ? filterEmail
                                : col.key === "position"
                                  ? filterPosition
                                  : ""
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
                  </td>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 2}
                    className="py-16 text-center text-gray-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 2}
                    className="py-16 text-center text-gray-400 text-sm"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds((prev) => [...prev, user.id]);
                          } else {
                            setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
                          }
                        }}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1">
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
                    </td>

                    {/* fullName */}
                    <td className="px-3 py-2.5 font-medium text-gray-800 text-sm">
                      {user.fullName}
                    </td>

                    {/* username */}
                    <td className="px-3 py-2.5 text-gray-600 text-sm">
                      {user.username}
                    </td>

                    {/* email */}
                    <td className="px-3 py-2.5 text-gray-600 text-sm">
                      {user.email}
                    </td>

                    {/* role */}
                    <td className="px-3 py-2.5 text-sm text-gray-600">
                      {user.role?.name ?? "—"}
                    </td>

                    {/* position */}
                    <td className="px-3 py-2.5 text-sm text-gray-600">
                      {user.position ?? "—"}
                    </td>

                    {/* isActive toggle */}
                    <td className="px-3 py-2.5">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer / Pagination ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/30 shrink-0">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span>Hiển thị</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-200 rounded px-1.5 py-0.5 bg-white focus:outline-none text-xs"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {from} - {to} / {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
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
