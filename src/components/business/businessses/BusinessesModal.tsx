"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import type { Enterprise } from "@/services/businessService";
import { businessService } from "@/services/businessService";



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


