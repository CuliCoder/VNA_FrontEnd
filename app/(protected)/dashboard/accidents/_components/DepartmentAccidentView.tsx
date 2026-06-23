"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

export function DepartmentAccidentView() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Quản lý báo cáo Tai nạn lao động (Sở LĐTBXH)
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
        <div className="py-10 text-center text-gray-500">
          <p>Giao diện dành cho Sở Lao động Thương binh và Xã hội.</p>
          <p className="text-sm mt-2">Tính năng và danh sách báo cáo đang được cập nhật...</p>
        </div>
      </div>
    </div>
  );
}
