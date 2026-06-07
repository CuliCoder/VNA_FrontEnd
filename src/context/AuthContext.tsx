"use client";
import * as React from "react";
import { authService } from "@/services/authService";
import type { AuthState, LoginRequest, User } from "@/types/auth";

interface AuthContextValue extends AuthState {
  login: (payload: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  React.useEffect(() => {
    authService
      .getMe()
      .then((user) =>
        setState({ user, isAuthenticated: true, isLoading: false }),
      )
      .catch(() =>
        setState({ user: null, isAuthenticated: false, isLoading: false }),
      );
  }, []);

  const login = async (payload: LoginRequest) => {
    const { user } = await authService.login(payload);
    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const setUser = (user: User) => {
    setState((prev) => ({ ...prev, user }));
    authService.getMe().catch(() => null); // sync với server
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext phải dùng bên trong <AuthProvider>");
  }
  return ctx;
}
