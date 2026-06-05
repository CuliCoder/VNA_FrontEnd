import React from "react";
import Sidebar from "@/components/layouts/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Header if needed can be placed here, or handled within the pages */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
