"use client";

import React from "react";
import BusinessForm from "@/components/business/BusinessForm";

export default function CreateBusinessPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header matching Screen 2 */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">Thông tin doanh nghiệp</h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Huỷ bỏ
          </button>
          <button
            type="submit"
            form="business-form"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            Tiếp tục
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <BusinessForm />
    </div>
  );
}
