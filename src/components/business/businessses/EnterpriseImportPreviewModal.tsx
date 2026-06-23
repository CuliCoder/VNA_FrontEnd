import React from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import type { ImportPreviewResult } from "@/types/adminUser";

export interface EnterpriseImportPreviewModalProps {
  open: boolean;
  previewData: ImportPreviewResult | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function EnterpriseImportPreviewModal({
  open,
  previewData,
  onClose,
  onConfirm,
  isLoading = false,
}: EnterpriseImportPreviewModalProps) {
  if (!open || !previewData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-white">Xem trước dữ liệu Import Doanh nghiệp</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white/80 hover:text-white transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          {/* Stats Bar */}
          <div className="mb-4 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Tổng số dòng</span>
              <span className="text-xl font-semibold text-gray-800">
                {previewData.totalRows}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Hợp lệ</span>
              <span className="text-xl font-semibold text-green-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {previewData.validCount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Lỗi</span>
              <span className="text-xl font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5" />
                {previewData.invalidCount}
              </span>
            </div>
          </div>

          {/* Table container */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">Dòng</th>
                    <th className="px-4 py-3 w-32">Trạng thái lỗi</th>
                    <th className="px-4 py-3 min-w-[200px]">Tên doanh nghiệp</th>
                    <th className="px-4 py-3 w-40">Mã số thuế</th>
                    <th className="px-4 py-3 w-36">Loại hình DN</th>
                    <th className="px-4 py-3 w-36">Ngành nghề KD</th>
                    <th className="px-4 py-3 min-w-[220px]">Địa chỉ ĐKKD</th>
                    <th className="px-4 py-3 w-48">Email</th>
                    <th className="px-4 py-3 w-44">Người đại diện</th>
                    <th className="px-4 py-3 min-w-[250px]">Chi tiết lỗi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.results.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.isValid ? "hover:bg-gray-50" : "bg-red-50/50 hover:bg-red-50"}
                    >
                      <td className="px-4 py-3 text-center text-gray-500 font-medium">
                        {row.rowNumber}
                      </td>
                      <td className="px-4 py-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Có lỗi
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {row.data?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono">
                        {row.data?.taxCode || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.data?.businessTypeCode || row.data?.businessType || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.data?.businessFieldCode || row.data?.businessField || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.data?.registeredAddress || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.data?.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.data?.representativeName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {!row.isValid && row.errors && row.errors.length > 0 ? (
                          <ul className="list-disc list-inside text-red-600 text-xs space-y-1">
                            {row.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning banner */}
          {previewData.invalidCount > 0 && (
            <p className="mt-4 text-sm text-amber-600 flex items-start gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                Hệ thống sẽ <strong>bỏ qua các dòng bị lỗi</strong> và chỉ import <strong>{previewData.validCount} dòng hợp lệ</strong>. Vui lòng kiểm tra kỹ trước khi xác nhận.
              </span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || previewData.validCount === 0}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-60 flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : null}
            Xác nhận Import ({previewData.validCount})
          </button>
        </div>
      </div>
    </div>
  );
}
