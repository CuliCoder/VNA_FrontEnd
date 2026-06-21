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
   */
  roles?: RoleCode[];
  /**
   * Permissions required to see this menu item. User must have at least one of these permissions.
   */
  permissions?: PermissionCode[];
  children?: MenuItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR_MENUS
// Mỗi menu item chỉ hiển thị với đúng roles hoặc permissions được chỉ định.
// ─────────────────────────────────────────────────────────────────────────────
export const SIDEBAR_MENUS: MenuItem[] = [
  // ── ADMIN / INTERNAL USERS ───────────────────────────────────────────────
  {
    title: "Hệ thống",
    icon: Settings,
    permissions: [
      "ROLE_MANAGE",
      "USER_MANAGE",
      "CATEGORY_MANAGE",
      "ENTERPRISE_VIEW",
      "PERIOD_MANAGE",
    ],
    children: [
      {
        title: "Phân quyền",
        url: "/dashboard/permissions",
        permissions: ["ROLE_MANAGE"],
      },
      {
        title: "Vai trò",
        url: "/dashboard/roles",
        permissions: ["ROLE_MANAGE"],
      },
      {
        title: "Quản lý người dùng",
        url: "/dashboard/users",
        permissions: ["USER_MANAGE"],
      },
      {
        title: "Loại hình doanh nghiệp",
        url: "/dashboard/business/business-types",
        permissions: ["CATEGORY_MANAGE"],
      },
      {
        title: "Ngành nghề kinh doanh",
        url: "/dashboard/business/business-fields",
        permissions: ["CATEGORY_MANAGE"],
      },
      {
        title: "Quản lý doanh nghiệp",
        url: "/dashboard/business/businesses",
        permissions: ["ENTERPRISE_VIEW", "ENTERPRISE_APPROVE"],
      },
      {
        title: "Kỳ báo cáo",
        url: "/dashboard/periods",
        permissions: ["PERIOD_MANAGE"],
      },
    ],
  },
  {
    title: "Tai nạn lao động",
    icon: LayoutDashboard,
    permissions: ["CATEGORY_MANAGE", "REPORT_MANAGE", "REPORT_VIEW"],
    children: [
      {
        title: "Danh mục chung",
        url: "/dashboard/common-categories",
        permissions: ["CATEGORY_MANAGE"],
      },
      {
        title: "TNLD theo HĐLĐ",
        url: "/dashboard/accidents",
        permissions: ["REPORT_MANAGE", "REPORT_VIEW"],
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
        url: "/dashboard/business/profile",
        permissions: ["ENTERPRISE_VIEW", "ENTERPRISE_APPROVE",],
        roles : ["ENTERPRISE"],
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

  // ── VIEWER / REPORTS ─────────────────────────────────────────────────────
  {
    title: "Báo cáo & Thống kê",
    url: "/dashboard/reports",
    icon: ClipboardCheck,
    roles: ["VIEWER"],
    permissions: ["REPORT_VIEW", "REPORT_EXPORT"],
  },
];
