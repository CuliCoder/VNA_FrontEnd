"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { EnterpriseAccidentView } from "./_components/EnterpriseAccidentView";
import { DepartmentAccidentView } from "./_components/DepartmentAccidentView";

export default function AccidentsPage() {
  const { user } = useAuth();

  // Hiển thị view doanh nghiệp nếu role là ENTERPRISE
  // Còn lại (Sở / Admin / v.v.) sẽ hiển thị view quản lý của Sở
  if (user?.role?.code === "ENTERPRISE") {
    return <EnterpriseAccidentView />;
  }

  return <DepartmentAccidentView />;
}
