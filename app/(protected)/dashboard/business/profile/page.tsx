"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import EditBusinessPage from "@/components/business/businessses/EditBusinessPage";

export default function BusinessProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  const enterpriseId = (user?.enterpriseProfile as any)?.id;

  if (!enterpriseId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p className="text-sm">Không tìm thấy thông tin doanh nghiệp liên kết với tài khoản này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-1">
      <EditBusinessPage enterpriseId={Number(enterpriseId)} />
    </div>
  );
}
