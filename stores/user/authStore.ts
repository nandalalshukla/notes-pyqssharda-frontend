import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, logout, logoutAll, getMe } from "@/lib/api/user/auth.api";
import { User } from "@/lib/api/user/user.api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authInitialized: boolean;
  lastLoginTime: number | null;

  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setAuthLoading: (loading: boolean) => void;
  setAuthInitialized: (initialized: boolean) => void;
  setUser: (user: User | null) => void;
}

const normalizeUser = (user: User | null) => {
  if (!user) return null;

  const anyUser = user as User & { id?: string };
  if (!anyUser._id && anyUser.id) {
    return { ...anyUser, _id: anyUser.id } as User;
  }

  return user;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authLoading: false,
      authInitialized: false,
      lastLoginTime: null,

      setAuthLoading: (loading) => set({ authLoading: loading }),
      setAuthInitialized: (initialized) =>
        set({ authInitialized: initialized }),

      setUser: (user) =>
        set({
          user: normalizeUser(user),
          isAuthenticated: Boolean(user),
        }),

      login: async (data) => {
        const res = await login(data);
        set({
          user: normalizeUser(res.data.data.user),
          isAuthenticated: true,
          authLoading: false,
          authInitialized: true,
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
          authInitialized: true,
          lastLoginTime: null,
        });
      },

      logoutAll: async () => {
        try {
          await logoutAll();
        } catch (error) {
          console.log("Logout all API error (ignored):", error);
        }
        set({
          user: null,
          isAuthenticated: false,
          authLoading: false,
          authInitialized: true,
          lastLoginTime: null,
        });
      },

      fetchMe: async () => {
        try {
          const res = await getMe();
          set({
            user: normalizeUser(res.data.data.user),
            isAuthenticated: true,
            authLoading: false,
            authInitialized: true,
          });
        } catch (error) {
          const status = (error as { response?: { status?: number } })
            ?.response?.status;
          if (status === 401 || status === 403) {
            set({
              user: null,
              isAuthenticated: false,
              authLoading: false,
              authInitialized: true,
              lastLoginTime: null,
            });
            return;
          }

          set({ authLoading: false, authInitialized: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
export { useAuthStore };
