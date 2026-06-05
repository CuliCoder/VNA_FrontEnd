"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, LogOut, Key, User } from "lucide-react";
import { SIDEBAR_MENUS, Role } from "@/constants/menus";
import { cn } from "@/lib/utils";

// Mock role for now, should come from AuthContext
const MOCK_ROLE: Role = "admin"; // Change to "business" to test screen 2

export default function Sidebar() {
  const pathname = usePathname();
  const userRole = MOCK_ROLE;
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Hệ thống": true,
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const filteredMenus = SIDEBAR_MENUS.filter((menu) =>
    menu.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col h-screen overflow-hidden">
      {/* Header / Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 shrink-0">
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-yellow-400 border border-yellow-400">
          ★
        </div>
        <div className="font-semibold text-sm leading-tight">
          Uỷ ban nhân dân tỉnh <br /> ABC
        </div>
        <button className="ml-auto text-white/70 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {filteredMenus.map((menu) => (
            <li key={menu.title}>
              {menu.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(menu.title)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                  >
                    {menu.icon && <menu.icon className="w-5 h-5" />}
                    <span className="flex-1 text-left">{menu.title}</span>
                    {openMenus[menu.title] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {openMenus[menu.title] && (
                    <ul className="bg-[#172e6e]">
                      {menu.children
                        .filter((child) => child.roles.includes(userRole))
                        .map((child) => (
                          <li key={child.title}>
                            <Link
                              href={child.url || "#"}
                              className={cn(
                                "flex items-center gap-3 pl-12 pr-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors relative",
                                pathname === child.url && "text-white font-medium before:absolute before:left-4 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:bg-white before:rounded-full"
                              )}
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={menu.url || "#"}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors",
                    pathname === menu.url && "bg-white/10 font-medium"
                  )}
                >
                  {menu.icon && <menu.icon className="w-5 h-5" />}
                  {menu.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Footer */}
      <div className="relative shrink-0 border-t border-white/10">
        {isProfileOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 text-sm z-50">
            <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
              <User className="w-4 h-4" />
              Thông tin tài khoản
            </Link>
            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
              <Key className="w-4 h-4" />
              Đổi mật khẩu
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600">
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        )}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-full flex items-center gap-3 p-4 hover:bg-white/10 transition-colors"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 shrink-0">
            <img src="/placeholder-avatar.png" alt="Avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23ccc"/><circle cx="16" cy="12" r="5" fill="%23fff"/><path d="M7 26c0-5 4-9 9-9s9 4 9 9" fill="%23fff"/></svg>')} />
          </div>
          <span className="flex-1 text-left text-sm font-medium truncate">Phan Thanh Tùng</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
