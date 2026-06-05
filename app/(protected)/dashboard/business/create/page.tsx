"use client";

import React from "react";
import BusinessForm from "@/components/business/BusinessForm";
import { useRouter } from "next/navigation";

export default function CreateBusinessPage() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-white px-6 py-3.5 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-base font-semibold text-gray-800">Thông tin doanh nghiệp</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition"
          >
            Huỷ bỏ
          </button>
          <button
            type="submit"
            form="business-form"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm flex items-center gap-1.5"
          >
            Tiếp tục
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <BusinessForm />
    </div>
  );
}
