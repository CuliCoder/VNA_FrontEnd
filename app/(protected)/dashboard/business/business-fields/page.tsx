import React from "react";
import BusinessFieldsView from "@/components/business/business-fields/BusinessFieldsView";

export const metadata = {
  title: "Danh sách ngành nghề kinh doanh",
};

export default function BusinessFieldsPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <BusinessFieldsView />
    </div>
  );
}
