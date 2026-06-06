"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { ChangeEmailModal } from "@/components/profile/ChangeEmailModal";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  useEffect(() => {
    const handler = () => setShowChangePassword(true);
    window.addEventListener("open-change-password", handler);
    return () => window.removeEventListener("open-change-password", handler);
  }, []);
  useEffect(() => {
    const handler = () => setShowChangeEmail(true);
    window.addEventListener("open-change-email", handler);
    return () => window.removeEventListener("open-change-email", handler);
  }, []);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Header if needed can be placed here, or handled within the pages */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <ChangeEmailModal
        open={showChangeEmail}
        onClose={() => setShowChangeEmail(false)}
      />
    </div>
  );
}
