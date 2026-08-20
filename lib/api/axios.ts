// lib/axios.ts
import axios from "axios";
import toast from "react-hot-toast";

// Same-origin path, proxied to the real backend by the rewrite in
// next.config.ts — see the comment there for why this can't be the
// backend's own (cross-site) URL directly.
const api = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 50000,
});

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;
// Only show the "session expired" toast once per page load — a burst of
// components can all get a 401 around the same time, and logging back in
// triggers a fresh page load anyway, which resets this naturally.
let sessionExpiredNotified = false;

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
        // Session is genuinely over — clear the persisted auth state (the
        // authStore rehydrates "logged out" from this on next read) and
        // tell the user once, rather than leaving requests silently
        // failing with no explanation. Guarded so a burst of requests
        // failing at once (common — several components refetch on the
        // same 401) doesn't stack duplicate toasts.
        if (typeof window !== "undefined") {
          const hadSession = Boolean(localStorage.getItem("auth-storage"));
          localStorage.removeItem("auth-storage");
          if (hadSession && !sessionExpiredNotified) {
            sessionExpiredNotified = true;
            toast.error("Your session has expired. Please sign in again.");
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
