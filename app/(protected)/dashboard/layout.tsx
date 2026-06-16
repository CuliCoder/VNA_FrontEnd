"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { ChangeEmailModal } from "@/components/profile/ChangeEmailModal";
import { SIDEBAR_MENUS, MenuItem } from "@/constants/menus";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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

  const userRole = user?.role?.code || "VIEWER";
  const userPermissions = user?.role?.permissions?.map((p: any) => p.code) || [];

  const hasAccess = (menu: MenuItem) => {
    if (menu.roles && menu.roles.length > 0) {
      if (menu.roles.includes(userRole as any)) return true;
    }
    if (menu.permissions && menu.permissions.length > 0) {
      if (menu.permissions.some((p) => userPermissions.includes(p))) return true;
    }
    return false;
  };

  const checkAccessToPath = (path: string) => {
    let foundMenu: MenuItem | null = null;
    const findMenu = (menus: MenuItem[]) => {
      for (const menu of menus) {
        if (menu.url && path.startsWith(menu.url)) {
          foundMenu = menu;
        }
        if (menu.children) findMenu(menu.children);
      }
    };
    findMenu(SIDEBAR_MENUS);

    if (foundMenu) {
      return hasAccess(foundMenu);
    }
    return true; 
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    } else if (!isLoading && isAuthenticated && user) {
      if (!checkAccessToPath(pathname)) {
        router.push("/dashboard/profile");
      }
    }
  }, [isAuthenticated, isLoading, router, pathname, userRole, userPermissions.join(','), user]);

  if (!isAuthenticated && !isLoading) return null;

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* Loading overlay — không unmount children */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              Đang tải...
            </div>
          )}
          <div style={{ visibility: isLoading ? "hidden" : "visible" }}>
            {children}
          </div>
        </div>
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
