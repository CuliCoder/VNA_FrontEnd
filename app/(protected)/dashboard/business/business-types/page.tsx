import React from "react";
import BusinessTypesView from "@/components/business/business-types/BusinessTypesView";

export const metadata = {
  title: "Danh sách loại hình kinh doanh",
};

export default function BusinessTypesPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <BusinessTypesView />
    </div>
  );
}
