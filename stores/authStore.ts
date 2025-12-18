import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, logout, getMe } from "@/lib/api/auth.api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authLoading: false,

      login: async (data) => {
        const res = await login(data);
        set({
          user: res.data.data.user,
          isAuthenticated: true,
          authLoading: false,
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
          set({
            user: null,
            isAuthenticated: false,
            authLoading: false,
          });
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
