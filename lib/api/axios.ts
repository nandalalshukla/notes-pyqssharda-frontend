// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 50000,
});

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;

const getPersistedAuthState = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawState = localStorage.getItem("auth-storage");
    if (!rawState) return null;

    return JSON.parse(rawState) as {
      state?: { isAuthenticated?: boolean; user?: unknown };
    };
  } catch {
    return null;
  }
};

const wasPreviouslyAuthenticated = () => {
  const state = getPersistedAuthState()?.state;
  return Boolean(state?.isAuthenticated || state?.user);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthMeRequest = requestUrl.includes("/auth/me");
    const canAttemptRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.includes("/auth/refresh-token") &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/logout") &&
      !requestUrl.includes("/auth/logout-all") &&
      (!isAuthMeRequest || wasPreviouslyAuthenticated());

    if (canAttemptRefresh) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = api.post("/auth/refresh-token").finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      try {
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
