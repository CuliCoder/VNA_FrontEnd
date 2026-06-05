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
  AlertTriangle
} from "lucide-react";

export type Role = "admin" | "business" | "user";

export interface MenuItem {
  title: string;
  url?: string;
  icon?: React.ElementType;
  roles: Role[];
  children?: MenuItem[];
}

export const SIDEBAR_MENUS: MenuItem[] = [
  // Admin menus (Screen 1)
  {
    title: "Hướng dẫn sử dụng",
    url: "/dashboard/guide",
    icon: BookOpen,
    roles: ["admin", "user"],
  },
  {
    title: "Trang chủ",
    url: "/dashboard",
    icon: Home,
    roles: ["admin", "user", "business"],
  },
  {
    title: "Hệ thống",
    icon: Settings,
    roles: ["admin"],
    children: [
      {
        title: "Quản lý người dùng",
        url: "/dashboard/users",
        roles: ["admin"],
        icon: Users,
      },
      {
        title: "Vai trò người dùng",
        url: "/dashboard/roles",
        roles: ["admin"],
        icon: Shield,
      },
      {
        title: "Tiếp nhận",
        url: "/dashboard/reception",
        roles: ["admin"],
        icon: Inbox,
      },
    ],
  },
  {
    title: "Quản trị phần mềm",
    icon: LayoutDashboard,
    roles: ["admin"],
    children: [
      {
        title: "Cấu hình",
        url: "/dashboard/config",
        roles: ["admin"],
      }
    ]
  },
  {
    title: "Chuẩn nghề nghiệp giáo viên",
    icon: GraduationCap,
    roles: ["admin", "user"],
    children: [
      {
        title: "Đánh giá",
        url: "/dashboard/teacher-eval",
        roles: ["admin", "user"],
      }
    ]
  },
  {
    title: "Chuẩn nghề nghiệp HT - HP",
    icon: Award,
    roles: ["admin", "user"],
    children: [
      {
        title: "Đánh giá",
        url: "/dashboard/ht-eval",
        roles: ["admin", "user"],
      }
    ]
  },
  {
    title: "Báo cáo thống kê",
    url: "/dashboard/reports",
    icon: BarChart,
    roles: ["admin", "business"],
  },

  // Business menus (Screen 2)
  {
    title: "Hệ thống",
    icon: Settings,
    roles: ["business"],
    children: [
      {
        title: "Thông tin doanh nghiệp",
        url: "/dashboard/business/create",
        roles: ["business"],
        icon: Briefcase,
      },
    ],
  },
  {
    title: "Tai nạn lao động",
    icon: AlertTriangle,
    roles: ["business"],
    children: [
      {
        title: "TNLĐ theo HĐLĐ",
        url: "/dashboard/accidents",
        roles: ["business"],
      }
    ]
  }
];
