export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard/profile",
  ACCOUNT: "/dashboard/profile",

  // Admin user management
  USERS: "/dashboard/users",
  USER_NEW: "/dashboard/users/new",
  USER_DETAIL: (id: number) => `/dashboard/users/${id}`,
  USER_VIEW: (id: number) => `/dashboard/users/${id}?view=true`,
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
