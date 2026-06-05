"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      console.log("📌 User Info from /user/me:", {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        roleCode: user.role?.code,
        roleName: user.role?.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    }
  }, [user]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Đang tải...</div>;
  }

  if (!isAuthenticated) return null;

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
