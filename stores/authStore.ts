import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, logout, getMe } from "@/lib/api/auth.api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "mod" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  contributions: number;
  modRequest?: "pending" | "approved" | "rejected" | null;
  contactNo?: string;
  modRequestAt?: string;
  modMotivation?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  lastLoginTime: number | null;

  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setAuthLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authLoading: false,
      lastLoginTime: null,

      setAuthLoading: (loading) => set({ authLoading: loading }),

      login: async (data) => {
        const res = await login(data);
        set({
          user: res.data.data.user,
          isAuthenticated: true,
          authLoading: false,
          lastLoginTime: Date.now(),
        });
      },

      logout: async () => {
        // Clear local state regardless of API response
        // (handles cases where session already expired on backend)
        try {
          await logout();
        } catch (error) {
          // Ignore 401 errors - session might already be expired
          console.log("Logout API error (ignored):", error);
        }
        set({
          user: null,
          isAuthenticated: false,
          authLoading: false,
          lastLoginTime: null,
        });
      },

      fetchMe: async () => {
        try {
          const res = await getMe();
          set({
            user: res.data.data.user,
            isAuthenticated: true,
            authLoading: false,
          });
        } catch (error) {
          // Silent failure - don't clear auth state on page load verification
          // Let the axios interceptor handle actual auth failures during user actions
          console.log(
            "Auth verification failed (cookies may need refresh):",
            error
          );
          set({ authLoading: false });
          // Auth state is preserved - will be cleared only if refresh token also fails
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
