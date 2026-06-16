import {
  BookOpen,
  Home,
  Settings,
  Users,
  Shield,
  Inbox,
  LayoutDashboard,
  GraduationCap,
  Award,
  BarChart,
  Briefcase,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

// All role codes from DB seed
export type RoleCode =
  | "ADMIN"
  | "ENTERPRISE"
  | "MANAGER"
  | "INSPECTOR"
  | "ANALYST"
  | "AUDITOR"
  | "REPORTER"
  | "VIEWER"
  | "COORDINATOR"
  | "SUPERVISOR";

// All permission codes from DB seed
export type PermissionCode =
  | "USER_MANAGE"
  | "ENTERPRISE_APPROVE"
  | "REPORT_MANAGE"
  | "REPORT_VIEW"
  | "REPORT_EXPORT"
  | "CATEGORY_MANAGE"
  | "ROLE_MANAGE"
  | "PERIOD_MANAGE"
  | "ENTERPRISE_VIEW"
  | "DASHBOARD_VIEW";

export interface MenuItem {
  title: string;
  url?: string;
  icon?: React.ElementType;
  /**
   * Roles that can see this menu item.
   * The Sidebar will filter based on user.role.code.
   */
  roles: RoleCode[];
  children?: MenuItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR_MENUS
// Mỗi menu item chỉ hiển thị với đúng roles được chỉ định.
//
// Screen 1 (ADMIN + non-enterprise):  Hướng dẫn → Trang chủ → Hệ thống → ...
// Screen 2 (ENTERPRISE):              Hệ thống (DN) → Tai nạn lao động
// ─────────────────────────────────────────────────────────────────────────────
export const SIDEBAR_MENUS: MenuItem[] = [
  // ── ADMIN only ───────────────────────────────────────────────────────────
  {
    title: "Hệ thống",
    icon: Settings,
    roles: ["ADMIN"],
    children: [
      {
        title: "Phân quyền",
        url: "/dashboard/permissions",
        roles: ["ADMIN"],
      },
      {
        title: "Vai trò",
        url: "/dashboard/roles",
        roles: ["ADMIN"],
      },
      {
        title: "Tài khoản",
        url: "/dashboard/users",
        roles: ["ADMIN"],
      },
      {
        title: "Loại hình doanh nghiệp",
        url: "/dashboard/business/business-types",
        roles: ["ADMIN"],
      },
      {
        title: "Ngành nghề kinh doanh",
        url: "/dashboard/business/business-fields",
        roles: ["ADMIN"],
      },
      {
        title: "Quản lý doanh nghiệp",
        url: "/dashboard/business/businesses",
        roles: ["ADMIN"],
      },
      {
        title: "Kỳ báo cáo",
        url: "/dashboard/periods",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Tai nạn lao động",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
    children: [
      {
        title: "Danh mục chung",
        url: "/dashboard/common-categories",
        roles: ["ADMIN"],
      },
      {
        title: "TNLD theo HĐLĐ",
        url: "/dashboard/accidents",
        roles: ["ADMIN"],
      },
    ],
  },
  // ── ENTERPRISE only ──────────────────────────────────────────────────────
  {
    title: "Hệ thống",
    icon: Settings,
    roles: ["ENTERPRISE"],
    children: [
      {
        title: "Thông tin doanh nghiệp",
        url: "/dashboard/business/create",
        roles: ["ENTERPRISE"],
      },
    ],
  },
  {
    title: "Tai nạn lao động",
    icon: AlertTriangle,
    roles: ["ENTERPRISE"],
    children: [
      {
        title: "TNLĐ theo HĐLĐ",
        url: "/dashboard/accidents",
        roles: ["ENTERPRISE"],
      },
    ],
  },

  // ── VIEWER (chỉ xem) ─────────────────────────────────────────────────────
  {
    title: "Báo cáo & Thống kê",
    url: "/dashboard/reports",
    icon: ClipboardCheck,
    roles: ["VIEWER"],
  },
];
