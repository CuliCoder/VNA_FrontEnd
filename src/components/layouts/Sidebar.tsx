"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Key,
  User as UserIcon,
  Menu,
} from "lucide-react";
import { SIDEBAR_MENUS, RoleCode, MenuItem } from "@/constants/menus";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { changePasswordEvents } from "@/hooks/useModal";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = (user?.role?.code || "VIEWER") as RoleCode;
  
  // Extract permissions from user object
  const userPermissions = user?.role?.permissions?.map((p: any) => p.code) || [];

  const hasAccess = (menu: MenuItem) => {
    if (menu.roles && menu.roles.length > 0) {
      if (menu.roles.includes(userRole)) return true;
    }
    if (menu.permissions && menu.permissions.length > 0) {
      if (menu.permissions.some((p) => userPermissions.includes(p))) return true;
    }
    return false;
  };

  // Auto-open the group that contains the current path
  const getInitialOpen = () => {
    const open: Record<string, boolean> = {};
    SIDEBAR_MENUS.forEach((menu) => {
      if (menu.children?.some((c) => c.url && pathname.startsWith(c.url))) {
        open[menu.title + (menu.roles?.join("") || "") + (menu.permissions?.join("") || "")] = true;
      }
    });
    return open;
  };

  const [openMenus, setOpenMenus] =
    useState<Record<string, boolean>>(getInitialOpen);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredMenus = SIDEBAR_MENUS.filter((menu) => hasAccess(menu));

  const avatarFallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23ccc"/><circle cx="16" cy="12" r="5" fill="%23fff"/><path d="M7 26c0-5 4-9 9-9s9 4 9 9" fill="%23fff"/></svg>`;
  return (
    <aside
      className={cn(
        "bg-[#1e3a8a] text-white flex flex-col h-screen overflow-hidden transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-[220px]",
      )}
    >
      {/* ── Header / Logo ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-white/10 shrink-0 min-h-[60px]">
        {/* Emblem */}
        <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-yellow-300 border border-yellow-400 text-base shrink-0 shadow-sm">
          ★
        </div>

        {!collapsed && (
          <span className="font-semibold text-[11px] leading-tight flex-1 truncate">
            Uỷ ban nhân dân tỉnh <br /> ABC
          </span>
        )}

        {/* Hamburger */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-white/10 transition shrink-0"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10">
        <ul className="space-y-px">
          {filteredMenus.map((menu) => {
            // Unique key per menu (in case two menus share same title but different roles e.g. "Hệ thống")
            const menuKey = menu.title + (menu.roles?.join("") || "") + (menu.permissions?.join("") || "");
            const isOpen = openMenus[menuKey];
            const isGroupActive = menu.children?.some(
              (c) => c.url && pathname.startsWith(c.url),
            );

            return (
              <li key={menuKey}>
                {menu.children ? (
                  <div>
                    {/* Group header */}
                    <button
                      onClick={() => toggleMenu(menuKey)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] hover:bg-white/10 transition-colors",
                        isGroupActive && "bg-white/5",
                      )}
                    >
                      {menu.icon && (
                        <menu.icon className="w-[18px] h-[18px] shrink-0 opacity-90" />
                      )}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left leading-tight">
                            {menu.title}
                          </span>
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </>
                      )}
                    </button>

                    {/* Children */}
                    {(isOpen || isGroupActive) && !collapsed && (
                      <ul className="bg-[#182f77]">
                        {menu.children
                          .filter((child) => hasAccess(child))
                          .map((child) => {
                            const isActive = child.url
                              ? pathname === child.url ||
                                pathname.startsWith(child.url)
                              : false;
                            return (
                              <li key={child.title}>
                                <Link
                                  href={child.url || "#"}
                                  className={cn(
                                    "flex items-center gap-2.5 pl-9 pr-3 py-2 text-[12.5px] relative transition-colors",
                                    isActive
                                      ? "text-white font-semibold bg-white/10"
                                      : "text-white/70 hover:text-white hover:bg-white/5",
                                  )}
                                >
                                  {/* Bullet dot */}
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                                      isActive ? "bg-white" : "bg-white/30",
                                    )}
                                  />
                                  {child.title}
                                </Link>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={menu.url || "#"}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors",
                      pathname === menu.url
                        ? "bg-white/15 font-semibold"
                        : "hover:bg-white/10 text-white/90",
                    )}
                  >
                    {menu.icon && (
                      <menu.icon className="w-[18px] h-[18px] shrink-0 opacity-90" />
                    )}
                    {!collapsed && (
                      <span className="leading-tight">{menu.title}</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User Profile Footer ──────────────────────────────────────── */}
      <div className="relative shrink-0 border-t border-white/10">
        {/* Profile popup (like in mockup) */}
        {isProfileOpen && (
          <div className="absolute bottom-full left-3 mb-2 w-52 bg-white text-gray-800 rounded-xl shadow-2xl py-2 text-sm z-50 ring-1 ring-gray-100">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {user?.role?.name}
              </p>
            </div>
            <Link
              href="/dashboard/profile"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span>Thông tin tài khoản</span>
            </Link>
            <button
              onClick={changePasswordEvents.open}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <Key className="w-4 h-4 text-gray-500" />
              <span>Đổi mật khẩu</span>
            </button>
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-full flex items-center gap-2.5 px-3 py-3 hover:bg-white/10 transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-400 shrink-0 ring-2 ring-white/30">
            <img
              src={user?.avatarUrl || avatarFallback}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = avatarFallback;
              }}
            />
          </div>
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-[13px] font-medium truncate">
                {user?.fullName || user?.username || "Tài khoản"}
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
