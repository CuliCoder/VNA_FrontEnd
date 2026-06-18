"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CreateBusinessFlow from "@/components/business/businessses/CreateBusinessFlow";

export default function CreateBusinessPage() {
  const router = useRouter();

  return (
    <div className="py-4">
      <CreateBusinessFlow
        onSuccess={() => router.push("/dashboard/business/businesses")}
        onCancel={() => router.push("/dashboard/business/businesses")}
      />
    </div>
  );
}
