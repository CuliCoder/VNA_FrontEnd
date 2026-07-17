import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG, API_ENDPOINTS } from "@/constants/apiConfig";
import { storage } from "./storage";
import type { ApiError } from "@/types/api";
import type { RefreshTokenResponse } from "@/types/auth";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: true,
});

const AUTH_ENDPOINTS_NO_REDIRECT = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS_NO_REDIRECT.some((ep) => url.includes(ep));
}

// ─── Response interceptor ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(),
  );
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;
    const skipRefresh = isAuthEndpoint(originalRequest.url);
    if (is401 && !alreadyRetried && !skipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject,
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axios.post<RefreshTokenResponse>(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true },
        );
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        storage.clearAll();

        // Call logout to clear httpOnly cookies on the backend before redirecting
        try {
          await axios.post(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`,
            {},
            { withCredentials: true }
          );
        } catch (e) {
          // ignore
        }
        const publicRoutes = ["/login", "/register", "/ForgotPassword"];
        const isPublic = publicRoutes.some((r) =>
          window.location.pathname.startsWith(r),
        );
        if (!isPublic) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message:
        (error.response?.data as { message?: string })?.message ??
        error.message,
      errors: (error.response?.data as { errors?: Record<string, string[]> })
        ?.errors,
    };

    return Promise.reject(apiError);
  },
);

export default apiClient;
