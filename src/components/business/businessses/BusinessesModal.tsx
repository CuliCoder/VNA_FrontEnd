"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import type { Enterprise } from "@/services/businessService";
import { businessService } from "@/services/businessService";

// ═══════════════════════════════════════════════════════════════════════════
// 1. DELETE CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface DeleteConfirmModalProps {
  open: boolean;
  ids: number[];
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  open,
  ids,
  onClose,
  onConfirm,
  isLoading,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-red-500 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Xác nhận xóa</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              Bạn có chắc muốn xóa{" "}
              <span className="font-semibold text-red-600">{ids.length} dữ liệu được chọn</span>?
              <br />
              <span className="text-gray-400 text-xs">Hành động này không thể hoàn tác.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition disabled:opacity-60 flex items-center gap-1.5 shadow-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. VIEW DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface ViewDetailModalProps {
  open: boolean;
  enterprise: Enterprise | null;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value?: string | Date | null }) {
  return (
      <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-800 font-medium">
        {value instanceof Date ? value.toISOString().split("T")[0] : (value ?? <span className="text-gray-300 italic">—</span>)}
      </span>
    </div>
  );
}

export function ViewDetailModal({ open, enterprise, onClose }: ViewDetailModalProps) {
  if (!open || !enterprise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-xl">
          <h2 className="text-base font-semibold text-white">Chi tiết doanh nghiệp</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Hồ sơ */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
              Thông tin về hồ sơ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Mã số thuế" value={enterprise.taxCode} />
              <InfoRow label="Tên doanh nghiệp" value={enterprise.name} />
              <InfoRow label="Tên viết bằng tiếng nước ngoài" value={enterprise.englishName} />
              <InfoRow label="Ngày cấp GPKD" value={enterprise.licenseIssueDate} />
              <InfoRow label="Loại hình kinh doanh" value={enterprise.businessType?.name} />
              <InfoRow label="Ngành nghề kinh doanh" value={enterprise.businessField?.name} />
              <InfoRow
                label="Địa chỉ đăng ký giấy phép kinh doanh"
                value={enterprise.registeredAddress}
              />
              <InfoRow
                label="Địa điểm kinh doanh"
                value={enterprise.operatingAddress}
              />
              <InfoRow label="Email" value={enterprise.email} />
              <InfoRow label="Số điện thoại cơ quan" value={enterprise.officePhone} />
              <InfoRow label="Người đứng đầu doanh nghiệp" value={enterprise.representativeName} />
              <InfoRow label="SĐT người đứng đầu" value={enterprise.representativePhone} />
            </div>
          </div>

          {/* File đính kèm placeholder */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
              File đính kèm
            </h3>
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Tên file</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Thông tin file</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 w-20">Xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enterprise.documents && enterprise.documents.length > 0 ? (
                    enterprise.documents.map((doc, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 text-gray-700">{doc.documentName || doc.documentType}</td>
                        <td className="px-4 py-2.5 text-gray-500">{doc.fileName}</td>
                        <td className="px-4 py-2.5 text-center">
                          <a
                            href={doc.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 transition inline-block"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-gray-500 text-sm">
                        Không có file đính kèm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CHANGE PASSWORD MODAL  (Frame 2632 style)
// ═══════════════════════════════════════════════════════════════════════════

interface ChangePasswordModalProps {
  open: boolean;
  enterprise: Enterprise | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  open,
  enterprise,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open || !enterprise) return null;

  const handleClose = () => {
    setNewPassword("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSave = async () => {
    if (!newPassword.trim()) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await businessService.changePassword({
        username: enterprise.user?.username || enterprise.taxCode,
        newPassword: newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1200);
    } catch (ex:any){
      setError(ex?.message[0]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Xác nhận</h2>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            Khởi tạo mật khẩu cho tài khoản{" "}
            <span className="font-bold text-gray-800">
              {enterprise.user?.username || enterprise.taxCode}
            </span>
          </p>

          {/* Password input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới mong muốn"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                error ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đổi mật khẩu thành công!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || success}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-60 flex items-center gap-1.5 shadow-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : null}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
