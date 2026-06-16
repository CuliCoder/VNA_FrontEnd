"use client";

import * as React from "react";
import { useAuthContext } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/auth";
import type { ApiError } from "@/types/api";

interface LoginOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useAuth() {
  const auth = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const withLoading = React.useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      clearErrors();
      try {
        const result = await fn();
        return result;
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr?.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(apiErr.errors).forEach(([field, msgs]) => {
            mapped[field] = msgs[0];
          });
          setFieldErrors(mapped);
        }
        setError(apiErr?.message ?? MESSAGES.COMMON.UNKNOWN_ERROR);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const login = async (
    payload: LoginRequest,
    options?: LoginOptions,
  ): Promise<boolean> => {
    const result = await withLoading(async () => {
      const loggedInUser = await auth.login(payload);
      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        let defaultRoute: string = ROUTES.DASHBOARD;
        if (loggedInUser?.role?.code === "ENTERPRISE") {
          defaultRoute = "/dashboard/business/create";
        }
        window.location.href = options?.redirectTo ?? defaultRoute;
      }
    });
    return result !== null;
  };

  const logout = async (): Promise<boolean> => {
    const result = await withLoading(async () => {
      await auth.logout();
      window.location.href = ROUTES.LOGIN;
    });
    return result !== null;
  };

  const forgotPassword = async (
    payload: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse | null> => {
    return withLoading(async () => {
      return await authService.forgotPassword(payload);
    });
  };

  const resetPassword = async (
    payload: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse | null> => {
    return withLoading(async () => {
      return await authService.resetPassword(payload);
    });
  };

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || isLoading,
    error,
    fieldErrors,
    clearErrors,
    setUser: auth.setUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
  };
}
