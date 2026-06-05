export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/",
  ACCOUNT: "/account",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
