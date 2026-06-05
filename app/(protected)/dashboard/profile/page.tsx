"use client";

import React from "react";
import AccountForm from "@/components/profile/AccountForm";

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header matching Screen 1 */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">Chi tiết người dùng</h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="account-form"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            Lưu
          </button>
        </div>
      </div>

      <AccountForm />
    </div>
  );
}
